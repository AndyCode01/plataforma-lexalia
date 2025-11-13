import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { crearConsulta, listarConsultas, responderConsulta } from '../controllers/consultaController.js';

const router = Router();

// Crear consulta (solo usuarios)
router.post('/',
  requireAuth,
  [
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('categoria').isIn(['civil', 'penal', 'laboral', 'familia', 'comercial', 'otro']).withMessage('Categoría inválida')
  ],
  crearConsulta
);

// Listar consultas
router.get('/', requireAuth, listarConsultas);

// Responder consulta (solo abogados)
router.post('/:consultaId/responder',
  requireAuth,
  [
    body('contenido').notEmpty().withMessage('El contenido de la respuesta es requerido')
  ],
  responderConsulta
);

export default router;
