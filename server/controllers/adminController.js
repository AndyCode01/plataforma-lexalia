import { Usuario } from '../models/Usuario.js';
import { Abogado } from '../models/Abogado.js';
import { Plan } from '../models/Plan.js';

// ============ USUARIOS ============

export const listarUsuarios = async (req, res) => {
  try {
    console.log('📋 Listando usuarios... Usuario que solicita:', req.user?.email, 'Rol:', req.user?.rol);
    const usuarios = await Usuario.findAll({
      include: [
        { model: Abogado, as: 'perfil', attributes: ['id', 'especialidad', 'ciudad', 'telefono'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Encontrados ${usuarios.length} usuarios`);
    const data = usuarios.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: u.activo,
      estado_pago: u.estado_pago,
      plan: u.plan,
      fecha_activacion: u.fecha_activacion,
      fecha_expiracion: u.fecha_expiracion,
      createdAt: u.createdAt,
      perfil: u.perfil ? {
        id: u.perfil.id,
        especialidad: u.perfil.especialidad,
        ciudad: u.perfil.ciudad,
        telefono: u.perfil.telefono
      } : null
    }));

    return res.json(data);
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const allowed = ['nombre', 'email', 'activo', 'estado_pago', 'plan', 'fecha_activacion', 'fecha_expiracion', 'rol'];
    const payload = {};
    for (const k of allowed) {
      if (k in req.body) payload[k] = req.body[k];
    }

    await usuario.update(payload);
    return res.json({ message: 'Usuario actualizado', usuario });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevenir que el admin se elimine a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador' });
    }
    
    const usuario = await Usuario.findByPk(id, { include: [{ model: Abogado, as: 'perfil' }] });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Eliminar perfil de abogado si existe
    if (usuario.perfil) {
      await Plan.destroy({ where: { abogado_id: usuario.perfil.id } });
      await usuario.perfil.destroy();
    }

    await usuario.destroy();
    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// ============ ABOGADOS ============

export const listarAbogadosAdmin = async (req, res) => {
  try {
    console.log('📋 Listando abogados... Usuario que solicita:', req.user?.email, 'Rol:', req.user?.rol);
    const abogados = await Abogado.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'activo', 'estado_pago', 'plan'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Encontrados ${abogados.length} abogados`);
    const data = abogados.map(a => ({
      id: a.id,
      usuario_id: a.usuario_id,
      nombre: a.usuario?.nombre,
      email: a.usuario?.email,
      activo: a.usuario?.activo,
      estado_pago: a.usuario?.estado_pago,
      plan: a.usuario?.plan,
      especialidad: a.especialidad,
      ciudad: a.ciudad,
      experiencia: a.experiencia,
      casos_ganados: a.casos_ganados,
      rating: a.rating,
      telefono: a.telefono,
      email_publico: a.email_publico,
      foto_url: a.foto_url,
      descripcion: a.descripcion,
      idiomas: a.idiomas,
      educacion: a.educacion,
      createdAt: a.createdAt
    }));

    return res.json(data);
  } catch (err) {
    console.error('Error al listar abogados:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const actualizarAbogadoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const abogado = await Abogado.findByPk(id);
    if (!abogado) return res.status(404).json({ message: 'Abogado no encontrado' });

    const allowed = [
      'especialidad',
      'ciudad',
      'experiencia',
      'casos_ganados',
      'rating',
      'telefono',
      'email_publico',
      'foto_url',
      'descripcion',
      'idiomas',
      'educacion'
    ];

    const payload = {};
    for (const k of allowed) {
      if (k in req.body) payload[k] = req.body[k];
    }

    if (Array.isArray(payload.idiomas)) payload.idiomas = payload.idiomas.join(',');

    await abogado.update(payload);
    return res.json({ message: 'Abogado actualizado', abogado });
  } catch (err) {
    console.error('Error al actualizar abogado:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const eliminarAbogado = async (req, res) => {
  try {
    const { id } = req.params;
    const abogado = await Abogado.findByPk(id);
    if (!abogado) return res.status(404).json({ message: 'Abogado no encontrado' });

    await Plan.destroy({ where: { abogado_id: id } });
    await abogado.destroy();

    return res.json({ message: 'Abogado eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar abogado:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
