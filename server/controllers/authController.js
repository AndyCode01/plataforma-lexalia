import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { Usuario } from '../models/Usuario.js';
import { Abogado } from '../models/Abogado.js';

const { JWT_SECRET = 'devsecret', JWT_EXPIRES_IN = '7d' } = process.env;

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, password, rol = 'usuario', perfil } = req.body;
    console.log('📝 Intentando registrar:', { nombre, email, rol });
    const exists = await Usuario.findOne({ where: { email } });
    if (exists) {
      console.log('❌ Email ya existe:', email);
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    // Si es usuario normal, activar automáticamente con plan básico
    // Si es abogado, dejar pendiente de pago hasta que complete el pago con plan premium
    const userData = {
      nombre,
      email,
      password_hash,
      rol,
      activo: rol === 'usuario' ? true : false,
      estado_pago: 'pendiente',
      plan: rol === 'usuario' ? 'basico' : 'premium'
    };
    
    const user = await Usuario.create(userData);

    if (rol === 'abogado') {
      const defaultPerfil = {
        usuario_id: user.id,
        especialidad: perfil?.especialidad || 'Derecho Civil',
        ciudad: perfil?.ciudad || 'Bogotá',
        experiencia: perfil?.experiencia || 0,
        rating: 0,
        casos_ganados: 0,
        telefono: perfil?.telefono || null,
        email_publico: perfil?.email_publico || null,
        foto_url: perfil?.foto_url || null,
        descripcion: perfil?.descripcion || null,
        idiomas: (perfil?.idiomas || []).join(',') || null,
        educacion: perfil?.educacion || null,
      };
      await Abogado.create(defaultPerfil);
    }

  return res.status(201).json({ message: 'Usuario registrado', userId: user.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const me = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.user.id, { include: [{ model: Abogado, as: 'perfil' }] });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
