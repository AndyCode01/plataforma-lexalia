import { Usuario } from '../models/Usuario.js';
import { Plan } from '../models/Plan.js';
import { Abogado } from '../models/Abogado.js';

export const crearPreferencia = async (req, res) => {
  try {
    // Validación temprana de configuración
    const token = process.env.MERCADOPAGO_TOKEN;
    if (!token || token.includes('REEMPLAZA') || token.trim() === '') {
      console.error('❌ MERCADOPAGO_TOKEN no configurado. Define un Access Token de prueba en server/.env');
      return res.status(500).json({
        message: 'MercadoPago no está configurado. Agrega MERCADOPAGO_TOKEN (Access Token de prueba) en server/.env y reinicia el servidor.'
      });
    }
    // Log token status
    const prefix = token.slice(0, 7);
    console.log(`[MP] Usando token con prefijo: ${prefix}*, longitud: ${token.length}`);

    const { usuarioId, plan = 'basico' } = req.body;
    const user = await Usuario.findByPk(usuarioId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.estado_pago === 'aprobado') return res.status(400).json({ message: 'Ya pagó' });

    const referencia = 'LEX-' + Math.random().toString(36).slice(2, 12);
    // Obtener perfil de abogado del usuario
    const abogado = await Abogado.findOne({ where: { usuario_id: user.id } });
    const abogadoId = abogado ? abogado.id : null;
    await Plan.create({ 
      abogado_id: abogadoId, 
      tipo: plan, 
      estado: 'activo', 
      referencia_pago: referencia, 
      estado_pago: 'pendiente', 
      fecha_inicio: new Date(), 
      fecha_fin: null 
    });

    // Usar fetch directo en lugar de SDK (SDK v2.9.0 tiene problemas con PolicyAgent)
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: 'Membresía Premium Lexalia',
            quantity: 1,
            unit_price: 100000,
            currency_id: 'COP',
          },
        ],
        external_reference: referencia,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/registro/exito`,
          failure: `${process.env.FRONTEND_URL}/registro/error`,
          pending: `${process.env.FRONTEND_URL}/registro/pending`,
        },
        notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook`,
      }),
    });

    const pref = await response.json();
    
    if (!response.ok || !pref.id) {
      console.error('❌ Error desde MP API:', {
        status: response.status,
        body: pref,
      });
      return res.status(response.status || 500).json({ 
        message: 'Error creando preferencia de pago', 
        error: pref.error || pref.message 
      });
    }

    console.log(`✅ Preferencia creada: ${pref.id}`);
    return res.json({ 
      url: pref.init_point || pref.sandbox_init_point, 
      referencia, 
      id: pref.id 
    });
  } catch (err) {
    console.error('❌ Error en crearPreferencia:', err.message);
    return res.status(500).json({ 
      message: 'Error creando preferencia de pago', 
      error: err.message 
    });
  }
};

export const obtenerEstadoSuscripcion = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const user = await Usuario.findByPk(usuarioId);
    
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const ahora = new Date();
    const diasRestantes = user.fecha_expiracion 
      ? Math.ceil((user.fecha_expiracion - ahora) / (1000 * 60 * 60 * 24))
      : null;

    const estado = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      activo: user.activo,
      estado_pago: user.estado_pago,
      plan: user.plan,
      fecha_activacion: user.fecha_activacion,
      fecha_expiracion: user.fecha_expiracion,
      diasRestantes,
      proximaRenovacion: user.fecha_expiracion,
      caducaProximamente: diasRestantes && diasRestantes <= 7 && diasRestantes > 0,
      caducado: diasRestantes && diasRestantes < 0,
    };

    return res.json(estado);
  } catch (err) {
    console.error('❌ Error obtener estado:', err.message);
    return res.status(500).json({ 
      message: 'Error obteniendo estado de suscripción'
    });
  }
};

export const renovarSuscripcion = async (req, res) => {
  try {
    const { usuarioId, plan = 'basico' } = req.body;
    const user = await Usuario.findByPk(usuarioId);
    
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.rol !== 'abogado') return res.status(400).json({ message: 'Solo abogados pueden renovar' });

    const referencia = 'REN-' + Math.random().toString(36).slice(2, 12);
    const abogado = await Abogado.findOne({ where: { usuario_id: user.id } });
    
    if (!abogado) return res.status(404).json({ message: 'Perfil de abogado no encontrado' });

    // Crear nuevo plan para la renovación
    await Plan.create({
      abogado_id: abogado.id,
      tipo: plan,
      estado: 'activo',
      referencia_pago: referencia,
      estado_pago: 'pendiente',
      fecha_inicio: new Date(),
      fecha_fin: null,
    });

    const token = process.env.MERCADOPAGO_TOKEN;
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: 'Renovación Membresía Lexalia',
            quantity: 1,
            unit_price: 100000,
            currency_id: 'COP',
          },
        ],
        external_reference: referencia,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/mi-perfil?renovacion=exitosa`,
          failure: `${process.env.FRONTEND_URL}/mi-perfil?renovacion=fallida`,
          pending: `${process.env.FRONTEND_URL}/mi-perfil?renovacion=pendiente`,
        },
        notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook`,
      }),
    });

    const pref = await response.json();
    
    if (!response.ok || !pref.id) {
      console.error('❌ Error renovación MP:', pref);
      return res.status(response.status || 500).json({ 
        message: 'Error creando preferencia de renovación',
        error: pref.error || pref.message 
      });
    }

    console.log(`✅ Preferencia de renovación creada: ${pref.id}`);
    return res.json({ 
      url: pref.init_point || pref.sandbox_init_point, 
      referencia, 
      id: pref.id 
    });
  } catch (err) {
    console.error('❌ Error en renovarSuscripcion:', err.message);
    return res.status(500).json({ 
      message: 'Error en renovación',
      error: err.message 
    });
  }
};

export const pagoWebhook = async (req, res) => {
  try {
    const topic = req.query.type || req.query.topic || req.body?.type;
    const dataId = req.query['data.id'] || req.query.id || req.body?.data?.id || req.body?.id;

    const token = process.env.MERCADOPAGO_TOKEN;
    if (!token) {
      console.error('❌ MERCADOPAGO_TOKEN no configurado para webhook');
      return res.status(500).json({ message: 'Token no configurado' });
    }

    let external_reference = req.body?.external_reference;
    let status = req.body?.collection_status || req.body?.status;

    const fetchMp = async (url) => {
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(`MP API ${resp.status}: ${body?.message || 'Error'}`);
      }
      return resp.json();
    };

    if (!external_reference && dataId) {
      if (topic === 'merchant_order') {
        const mo = await fetchMp(`https://api.mercadopago.com/merchant_orders/${dataId}`);
        external_reference = mo?.external_reference;
        if (!status && mo?.payments?.length) status = mo.payments[0]?.status;
      } else {
        const payment = await fetchMp(`https://api.mercadopago.com/v1/payments/${dataId}`);
        external_reference = payment?.external_reference;
        status = payment?.status;
        if (!external_reference && payment?.order?.id) {
          const mo = await fetchMp(`https://api.mercadopago.com/merchant_orders/${payment.order.id}`);
          external_reference = mo?.external_reference;
          if (!status && mo?.payments?.length) status = mo.payments[0]?.status;
        }
      }
    }

    if (!external_reference) return res.sendStatus(200);
    const plan = await Plan.findOne({ where: { referencia_pago: external_reference } });
    if (!plan) return res.sendStatus(200);
    if (status === 'approved') {
      plan.estado_pago = 'aprobado';
      plan.estado = 'activo';
      plan.fecha_fin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await plan.save();
      // Activar usuario dueño del abogado
      const abogado = await Abogado.findByPk(plan.abogado_id);
      if (abogado) {
        const user = await Usuario.findByPk(abogado.usuario_id);
        if (user) {
          user.activo = true;
          user.estado_pago = 'aprobado';
          user.fecha_activacion = new Date();
          user.fecha_expiracion = plan.fecha_fin;
          user.plan = plan.tipo;
          await user.save();
        }
      }
    } else if (status === 'rejected' || status === 'cancelled') {
      plan.estado_pago = 'rechazado';
      plan.estado = 'suspendido';
      await plan.save();
      const abogado = await Abogado.findByPk(plan.abogado_id);
      if (abogado) {
        const user = await Usuario.findByPk(abogado.usuario_id);
        if (user) {
          user.activo = false;
          user.estado_pago = 'rechazado';
          await user.save();
        }
      }
    }
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en webhook de pago' });
  }
};
