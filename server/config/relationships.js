import { Usuario } from '../models/Usuario.js';
import { Consulta } from '../models/Consulta.js';
import { Respuesta } from '../models/Respuesta.js';

export const defineModelRelationships = () => {
  // Usuario -> Consulta
  Usuario.hasMany(Consulta, { foreignKey: 'usuario_id', as: 'consultas' });
  Consulta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Consulta -> Respuesta
  Consulta.hasMany(Respuesta, { foreignKey: 'consulta_id', as: 'respuestas' });
  Respuesta.belongsTo(Consulta, { foreignKey: 'consulta_id', as: 'consulta' });

  // Abogado (Usuario) -> Respuesta
  Usuario.hasMany(Respuesta, { foreignKey: 'abogado_id', as: 'respuestas' });
  Respuesta.belongsTo(Usuario, { foreignKey: 'abogado_id', as: 'abogado' });
};
