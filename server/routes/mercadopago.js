import { Router } from 'express';
import { crearPreferencia, pagoWebhook } from '../controllers/mercadoPagoController.js';
import { Usuario } from '../models/Usuario.js';
import { Abogado } from '../models/Abogado.js';
import { Plan } from '../models/Plan.js';

const router = Router();

router.post('/preferencia', crearPreferencia);
router.post('/webhook', pagoWebhook);

// Endpoint temporal para desarrollo: simula aprobación sin MercadoPago
router.post('/simular-pago', async (req, res) => {
  try {
    const { usuarioId, plan = 'basico' } = req.body;
    
    const user = await Usuario.findByPk(usuarioId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    const abogado = await Abogado.findOne({ where: { usuario_id: user.id } });
    if (!abogado) return res.status(404).json({ message: 'Perfil de abogado no encontrado' });
    
    // Crear plan aprobado directamente
    const referencia = 'DEV-' + Math.random().toString(36).slice(2, 12);
    const nuevoPlan = await Plan.create({
      abogado_id: abogado.id,
      tipo: plan,
      estado: 'activo',
      referencia_pago: referencia,
      estado_pago: 'aprobado',
      fecha_inicio: new Date(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    
    // Activar usuario
    user.activo = true;
    user.estado_pago = 'aprobado';
    user.fecha_activacion = new Date();
    user.fecha_expiracion = nuevoPlan.fecha_fin;
    user.plan = plan;
    await user.save();
    
    console.log(`✅ Pago simulado para usuario ${user.id} - Plan ${plan} activado`);
    
    return res.json({
      message: 'Pago simulado exitosamente',
      referencia,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        activo: user.activo,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error('Error simulando pago:', err);
    return res.status(500).json({ message: 'Error simulando pago' });
  }
});

export default router;
