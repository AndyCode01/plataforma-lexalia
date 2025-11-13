import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('email')
    .isEmail()
    .withMessage('El email no es válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  register
);

router.post('/login', body('email').isEmail(), body('password').notEmpty(), login);
router.get('/me', authRequired, me);

export default router;
