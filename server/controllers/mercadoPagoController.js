import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from 'mercadopago';
import { Usuario } from '../models/Usuario.js';
import { Plan } from '../models/Plan.js';
import { Abogado } from '../models/Abogado.js';

// Instancia del SDK de MercadoPago
const mp = new MercadoPagoConfig({ access_token: process.env.MERCADOPAGO_TOKEN });

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
    // Log mínimo y seguro para verificar qué tipo de token se está usando
    const prefix = token.slice(0, 7);
    console.log(`[MP] Usando token con prefijo: ${prefix}*, longitud: ${token.length}, isTest=${token.startsWith('TEST-')}`);

    const { usuarioId, plan = 'basico' } = req.body;
    const user = await Usuario.findByPk(usuarioId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.estado_pago === 'aprobado') return res.status(400).json({ message: 'Ya pagó' });

    const referencia = 'LEX-' + Math.random().toString(36).slice(2, 12);
  // Obtener perfil de abogado del usuario
  const abogado = await Abogado.findOne({ where: { usuario_id: user.id } });
  const abogadoId = abogado ? abogado.id : null;
  await Plan.create({ abogado_id: abogadoId, tipo: plan, estado: 'activo', referencia_pago: referencia, estado_pago: 'pendiente', fecha_inicio: new Date(), fecha_fin: null });

    const preferenceClient = new Preference(mp);
    const pref = await preferenceClient.create({
      body: {
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
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook`,
      },
    });
    return res.json({ url: pref.init_point || pref.sandbox_init_point, referencia, id: pref.id });
  } catch (err) {
    // Log enriquecido para depurar errores de MercadoPago
    if (err && typeof err === 'object') {
      console.error('❌ Error creando preferencia MP:', JSON.stringify(err, null, 2));
    } else {
      console.error(err);
    }
    const hint = (err && err.code === 'PA_UNAUTHORIZED_RESULT_FROM_POLICIES')
      ? 'Tu cuenta/credencial de MercadoPago no está autorizada para esta operación (PolicyAgent 403). Usa un Access Token de PRUEBA (TEST-...) del usuario vendedor.'
      : undefined;
    return res.status(500).json({ message: 'Error creando preferencia de pago', code: err?.code, status: err?.status, hint });
  }
};

export const pagoWebhook = async (req, res) => {
  try {
    const topic = req.query.type || req.query.topic || req.body?.type;
    const dataId = req.query['data.id'] || req.query.id || req.body?.data?.id || req.body?.id;

    let external_reference = req.body?.external_reference;
    let status = req.body?.collection_status || req.body?.status;

    if (!external_reference && topic === 'payment' && dataId) {
      const paymentClient = new Payment(mp);
      const payment = await paymentClient.get({ id: dataId });
      external_reference = payment?.external_reference;
      status = payment?.status;
      if (!external_reference && payment?.order?.id) {
        const moClient = new MerchantOrder(mp);
        const mo = await moClient.get({ id: payment.order.id });
        external_reference = mo?.external_reference;
        if (!status && mo?.payments?.length) status = mo.payments[0]?.status;
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
