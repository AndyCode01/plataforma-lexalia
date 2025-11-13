import { Router } from 'express';
import { listar, obtener, actualizar } from '../controllers/abogadoController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', listar);
router.get('/:id', obtener);
router.patch('/:id', authRequired, actualizar);

export default router;
