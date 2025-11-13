import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import {
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  listarAbogadosAdmin,
  actualizarAbogadoAdmin,
  eliminarAbogado
} from '../controllers/adminController.js';

const router = Router();

console.log('🔧 Registrando rutas de admin...');

// Todas las rutas requieren autenticación y rol de admin
router.use(authRequired);
router.use(requireRole('admin'));

// Usuarios
router.get('/usuarios', listarUsuarios);
router.put('/usuarios/:id', actualizarUsuario);
router.delete('/usuarios/:id', eliminarUsuario);

// Abogados
router.get('/abogados', listarAbogadosAdmin);
router.put('/abogados/:id', actualizarAbogadoAdmin);
router.delete('/abogados/:id', eliminarAbogado);

console.log('✅ Rutas de admin registradas');

export default router;
