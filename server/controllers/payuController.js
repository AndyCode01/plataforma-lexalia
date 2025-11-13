import { Usuario } from '../models/Usuario.js';
import { Plan } from '../models/Plan.js';
import crypto from 'crypto';

// Simulación: genera referencia y redirige a PayU (en real, usar SDK o API)
export const crearOrden = async (req, res) => {
  try {
    const { usuarioId, plan = 'basico' } = req.body;
    const user = await Usuario.findByPk(usuarioId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.estado_pago === 'aprobado') return res.status(400).json({ message: 'Ya pagó' });

    // Generar referencia única
    const referencia = 'LEX-' + crypto.randomBytes(8).toString('hex');
    // Crear plan pendiente
    await Plan.create({ abogado_id: user.id, tipo: plan, estado: 'activo', referencia_pago: referencia, estado_pago: 'pendiente', fecha_inicio: new Date(), fecha_fin: null });

    // Simular URL de PayU (en real, construir con API)
    const payuUrl = `https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu?ref=${referencia}`;
    return res.json({ url: payuUrl, referencia });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creando orden de pago' });
  }
};

// Webhook/callback PayU
export const pagoWebhook = async (req, res) => {
  try {
    const { referencia, estado } = req.body; // PayU envía POST con referencia y estado
    const plan = await Plan.findOne({ where: { referencia_pago: referencia } });
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });
    if (estado === 'APPROVED') {
      plan.estado_pago = 'aprobado';
      plan.estado = 'activo';
      plan.fecha_fin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
      await plan.save();
      // Activar usuario
      const user = await Usuario.findByPk(plan.abogado_id);
      if (user) {
        user.activo = true;
        user.estado_pago = 'aprobado';
        user.fecha_activacion = new Date();
        user.fecha_expiracion = plan.fecha_fin;
        user.plan = plan.tipo;
        await user.save();
      }
    } else if (estado === 'REJECTED') {
      plan.estado_pago = 'rechazado';
      plan.estado = 'suspendido';
      await plan.save();
      const user = await Usuario.findByPk(plan.abogado_id);
      if (user) {
        user.activo = false;
        user.estado_pago = 'rechazado';
        await user.save();
      }
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en webhook de pago' });
  }
};
