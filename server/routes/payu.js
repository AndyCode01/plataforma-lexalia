import { Router } from 'express';
import { crearOrden, pagoWebhook } from '../controllers/payuController.js';

const router = Router();

// Crear orden de pago y obtener URL de PayU
router.post('/orden', crearOrden);
// Webhook/callback de PayU
router.post('/webhook', pagoWebhook);

export default router;
