import { Usuario } from '../models/Usuario.js';
import { Plan } from '../models/Plan.js';
import { Abogado } from '../models/Abogado.js';

const normalizeBaseUrl = (url = '') => url.replace(/\/+$/, '');

const buildWebhookUrl = (backendUrl = '') => {
  const base = normalizeBaseUrl(backendUrl);
  if (!base) return null;
  if (base.endsWith('/api')) return `${base}/mercadopago/webhook`;
  return `${base}/api/mercadopago/webhook`;
};

const resolveCheckoutMode = () => {
  const mode = (process.env.MP_CHECKOUT_MODE || '').trim().toLowerCase();
  if (mode === 'sandbox' || mode === 'production') return mode;
  // Default estable: usar checkout normal (init_point)
  return 'production';
};

const pickCheckoutUrl = (pref) => {
  const mode = resolveCheckoutMode();
  if (mode === 'sandbox') return pref.sandbox_init_point || pref.init_point;
  return pref.init_point || pref.sandbox_init_point;
};

const aplicarEstadoPago = async (plan, status) => {
  if (status === 'approved') {
    plan.estado_pago = 'aprobado';
    plan.estado = 'activo';
    // Calcular fecha_fin: mismo día del mes siguiente (estándar Netflix/Spotify)
    const fechaInicio = plan.fecha_inicio || new Date();
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + 1); // +1 mes calendario
    plan.fecha_fin = fechaFin;
    await plan.save();

    const abogado = await Abogado.findByPk(plan.abogado_id);
    if (!abogado) return;
    const user = await Usuario.findByPk(abogado.usuario_id);
    if (!user) return;
    user.activo = true;
    user.estado_pago = 'aprobado';
    // Solo establecer fecha_activacion si no existe
    if (!user.fecha_activacion) {
      user.fecha_activacion = fechaInicio;
    }
    user.fecha_expiracion = plan.fecha_fin;
    user.plan = plan.tipo;
    await user.save();
    return;
  }

  if (status === 'rejected' || status === 'cancelled') {
    plan.estado_pago = 'rechazado';
    plan.estado = 'suspendido';
    await plan.save();
    const abogado = await Abogado.findByPk(plan.abogado_id);
    if (!abogado) return;
    const user = await Usuario.findByPk(abogado.usuario_id);
    if (!user) return;
    user.activo = false;
    user.estado_pago = 'rechazado';
    await user.save();
  }
};

const syncPagoPendiente = async (user) => {
  if (!user || user.estado_pago === 'aprobado') return;
  const abogado = await Abogado.findOne({ where: { usuario_id: user.id } });
  if (!abogado) return;
  const plan = await Plan.findOne({
    where: { abogado_id: abogado.id },
    order: [['createdAt', 'DESC']],
  });
  if (!plan || plan.estado_pago !== 'pendiente' || !plan.referencia_pago) return;

  const token = process.env.MERCADOPAGO_TOKEN;
  if (!token) return;

  const url = `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(plan.referencia_pago)}`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return;
  const data = await resp.json().catch(() => ({}));
  const payment = data?.results?.[0];
  const status = payment?.status;
  if (!status) return;
  await aplicarEstadoPago(plan, status);
};

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

    const webhookUrl = buildWebhookUrl(process.env.BACKEND_URL);

    // Usar fetch directo en lugar de SDK (SDK v2.9.0 tiene problemas con PolicyAgent)
    const subscriptionPrice = parseFloat(process.env.MP_SUBSCRIPTION_PRICE || '100000');

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
            description: 'Suscripción mensual Premium para abogados',
            quantity: 1,
            unit_price: subscriptionPrice,
            currency_id: 'COP',
          },
        ],
        external_reference: referencia,
        statement_descriptor: 'LEXALIA',
        payment_methods: {
          excluded_payment_methods: [
            // Excluir todas las tarjetas
            { id: 'visa' },
            { id: 'master' },
            { id: 'amex' },
            { id: 'naranja' },
            { id: 'maestro' },
            { id: 'cabal' },
            { id: 'diners' },
            { id: 'codensa' },
            // Excluir pagos en efectivo
            { id: 'efecty' },
            { id: 'baloto' }
          ],
          excluded_payment_types: [
            { id: 'ticket' },
            { id: 'atm' },
            { id: 'debit_card' },
            { id: 'credit_card' },
            { id: 'prepaid_card' }
          ],
          installments: 1,
          default_installments: 1
        },
        ...(process.env.FRONTEND_URL?.startsWith('https://') ? { auto_return: 'approved' } : {}),
        back_urls: {
          success: `${process.env.FRONTEND_URL}/registro/exito`,
          failure: `${process.env.FRONTEND_URL}/registro/error`,
          pending: `${process.env.FRONTEND_URL}/registro/pending`,
        },
        ...(webhookUrl ? { notification_url: webhookUrl } : {}),
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

    const mode = resolveCheckoutMode();
    const checkoutUrl = pickCheckoutUrl(pref);
    console.log(`✅ Preferencia creada: ${pref.id}`);
    return res.json({ 
      url: checkoutUrl,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
      mode,
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

    await syncPagoPendiente(user);

    const ahora = new Date();
    const diasRestantes = user.fecha_expiracion 
      ? Math.ceil((new Date(user.fecha_expiracion).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
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
    const subscriptionPrice = parseFloat(process.env.MP_SUBSCRIPTION_PRICE || '100000');
    const webhookUrl = buildWebhookUrl(process.env.BACKEND_URL);
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
            description: 'Renovación suscripción mensual Premium',
            quantity: 1,
            unit_price: subscriptionPrice,
            currency_id: 'COP',
          },
        ],
        external_reference: referencia,
        statement_descriptor: 'LEXALIA',
        payment_methods: {
          excluded_payment_methods: [
            // Excluir todas las tarjetas
            { id: 'visa' },
            { id: 'master' },
            { id: 'amex' },
            { id: 'naranja' },
            { id: 'maestro' },
            { id: 'cabal' },
            { id: 'diners' },
            { id: 'codensa' },
            // Excluir pagos en efectivo
            { id: 'efecty' },
            { id: 'baloto' }
          ],
          excluded_payment_types: [
            { id: 'ticket' },
            { id: 'atm' },
            { id: 'debit_card' },
            { id: 'credit_card' },
            { id: 'prepaid_card' }
          ],
          installments: 1,
          default_installments: 1
        },
        ...(process.env.FRONTEND_URL?.startsWith('https://') ? { auto_return: 'approved' } : {}),

        back_urls: {
          success: `${process.env.FRONTEND_URL}/mi-perfil?renovacion=exitosa`,
          failure: `${process.env.FRONTEND_URL}/mi-perfil?renovacion=fallida`,
          pending: `${process.env.FRONTEND_URL}/mi-perfil?renovacion=pendiente`,
        },
        ...(webhookUrl ? { notification_url: webhookUrl } : {}),
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
    const mode = resolveCheckoutMode();
    const checkoutUrl = pickCheckoutUrl(pref);
    return res.json({ 
      url: checkoutUrl,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
      mode,
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

export const confirmarPagoDesdeRetorno = async (req, res) => {
  try {
    const { paymentId, externalReference } = req.body || {};
    const token = process.env.MERCADOPAGO_TOKEN;
    if (!token) {
      return res.status(500).json({ message: 'MercadoPago no configurado' });
    }

    let reference = externalReference || null;
    let status = null;

    if (paymentId) {
      const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const payment = await resp.json().catch(() => ({}));
        reference = reference || payment?.external_reference || null;
        status = payment?.status || null;
      }
    }

    if (!reference) {
      return res.status(400).json({ message: 'No se pudo determinar external_reference' });
    }

    const plan = await Plan.findOne({ where: { referencia_pago: reference } });
    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado para la referencia' });
    }

    if (status) {
      await aplicarEstadoPago(plan, status);
      await plan.reload();
    }

    const abogado = plan.abogado_id ? await Abogado.findByPk(plan.abogado_id) : null;
    const user = abogado ? await Usuario.findByPk(abogado.usuario_id) : null;

    return res.json({
      ok: true,
      referencia: reference,
      payment_status: status,
      estado_pago_plan: plan.estado_pago,
      usuario: user
        ? {
            id: user.id,
            activo: user.activo,
            estado_pago: user.estado_pago,
            plan: user.plan,
          }
        : null,
    });
  } catch (err) {
    console.error('Error confirmando pago desde retorno:', err);
    return res.status(500).json({ message: 'Error confirmando pago desde retorno' });
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
    await aplicarEstadoPago(plan, status);
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en webhook de pago' });
  }
};
