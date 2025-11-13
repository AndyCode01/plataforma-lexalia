import { Op } from 'sequelize';
import { Abogado } from '../models/Abogado.js';
import { Usuario } from '../models/Usuario.js';

export const listar = async (req, res) => {
  try {
    const { ciudad, especialidad, q } = req.query;
    const where = {};
    if (ciudad && ciudad !== 'Todas') where.ciudad = ciudad;
    if (especialidad && especialidad !== 'Todas') where.especialidad = especialidad;
    if (q) where.descripcion = { [Op.like]: `%${q}%` };

    const rows = await Abogado.findAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }],
      order: [['rating', 'DESC']]
    });

    const data = rows.map((r) => ({
      id: r.id,
      nombre: r.usuario?.nombre,
      especialidad: r.especialidad,
      ciudad: r.ciudad,
      experiencia: r.experiencia,
      rating: r.rating,
      casosGanados: r.casos_ganados,
      telefono: r.telefono,
      email: r.email_publico,
      foto: r.foto_url,
      descripcion: r.descripcion,
      idiomas: r.idiomas?.split(',').filter(Boolean) || [],
      educacion: r.educacion
    }));

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await Abogado.findByPk(id, { include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] }] });
    if (!r) return res.status(404).json({ message: 'No encontrado' });
    const data = {
      id: r.id,
      nombre: r.usuario?.nombre,
      especialidad: r.especialidad,
      ciudad: r.ciudad,
      experiencia: r.experiencia,
      rating: r.rating,
      casosGanados: r.casos_ganados,
      telefono: r.telefono,
      email: r.email_publico,
      foto: r.foto_url,
      descripcion: r.descripcion,
      idiomas: r.idiomas?.split(',').filter(Boolean) || [],
      educacion: r.educacion
    };
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const abogado = await Abogado.findByPk(id);
    if (!abogado) return res.status(404).json({ message: 'No encontrado' });

    // Solo el dueño (usuario_id) o admin pueden editar
    const isOwner = req.user?.id === abogado.usuario_id;
    const isAdmin = req.user?.rol === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'No autorizado' });

    const allowed = [
      'especialidad',
      'ciudad',
      'experiencia',
      'casos_ganados',
      'telefono',
      'email_publico',
      'foto_url',
      'descripcion',
      'idiomas',
      'educacion'
    ];

    const payload = {};
    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

    // Normalizar idiomas: array -> CSV
    if (Array.isArray(payload.idiomas)) payload.idiomas = payload.idiomas.join(',');

    await abogado.update(payload);
    return res.json({ message: 'Perfil actualizado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
