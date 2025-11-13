import { validationResult } from 'express-validator';
import { Consulta } from '../models/Consulta.js';
import { Respuesta } from '../models/Respuesta.js';
import { Usuario } from '../models/Usuario.js';

// Crear una nueva consulta (solo usuarios)
export const crearConsulta = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, descripcion, categoria } = req.body;
    const usuario_id = req.user.id;

    // Verificar que el usuario tenga rol 'usuario'
    const usuario = await Usuario.findByPk(usuario_id);
    if (usuario.rol !== 'usuario') {
      return res.status(403).json({ message: 'Solo los usuarios pueden crear consultas' });
    }

    const consulta = await Consulta.create({
      usuario_id,
      titulo,
      descripcion,
      categoria
    });

    return res.status(201).json(consulta);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al crear consulta' });
  }
};

// Listar todas las consultas (usuarios ven sus consultas, abogados ven todas)
export const listarConsultas = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id);
    
    let consultas;
  if (usuario.rol === 'abogado' || usuario.rol === 'admin') {
      // Abogados ven todas las consultas
      consultas = await Consulta.findAll({
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'email']
          },
          {
            model: Respuesta,
            as: 'respuestas',
            include: [
              {
                model: Usuario,
                as: 'abogado',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
    } else {
      // Usuarios solo ven sus consultas
      consultas = await Consulta.findAll({
        where: { usuario_id: req.user.id },
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'email']
          },
          {
            model: Respuesta,
            as: 'respuestas',
            include: [
              {
                model: Usuario,
                as: 'abogado',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
    }

    return res.json(consultas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener consultas' });
  }
};

// Responder una consulta (abogados a cualquier consulta; usuarios solo a sus propias consultas)
export const responderConsulta = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { consultaId } = req.params;
    const { contenido } = req.body;
    const autor_id = req.user.id;
    const usuario = await Usuario.findByPk(autor_id);

    // Verificar que la consulta existe
    const consulta = await Consulta.findByPk(consultaId);
    if (!consulta) {
      return res.status(404).json({ message: 'Consulta no encontrada' });
    }

    // Reglas: abogados pueden responder cualquier consulta; usuarios solo sus propias consultas
    const esAbogado = usuario.rol === 'abogado' || usuario.rol === 'admin';
    const esAutorConsulta = Number(consulta.usuario_id) === Number(autor_id);
    const puedeResponder = esAbogado || (usuario.rol === 'usuario' && esAutorConsulta);

    console.log('Permisos respuesta:', { 
      usuario_id: autor_id, 
      rol: usuario.rol, 
      consulta_id: consultaId, 
      consulta_usuario_id: consulta.usuario_id,
      esAbogado,
      esAutorConsulta,
      puedeResponder
    });

    if (!puedeResponder) {
      return res.status(403).json({ message: 'No estás autorizado para responder esta consulta' });
    }

    const respuesta = await Respuesta.create({
      consulta_id: consultaId,
      abogado_id: autor_id,
      contenido
    });

    // Actualizar estado de la consulta
    await consulta.update({ estado: 'respondida' });

    return res.status(201).json(respuesta);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al responder consulta' });
  }
};
