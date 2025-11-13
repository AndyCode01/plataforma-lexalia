import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';
import { Abogado } from '../models/Abogado.js';

export const authRequired = async (req, res, next) => {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token requerido' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await Usuario.findByPk(payload.id, { include: [{ model: Abogado, as: 'perfil' }] });
    if (!user) return res.status(401).json({ message: 'Usuario no válido' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  if (!roles.includes(req.user.rol)) return res.status(403).json({ message: 'No autorizado' });
  next();
};
