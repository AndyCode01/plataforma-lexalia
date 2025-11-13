import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Usuario } from './Usuario.js';

export class Abogado extends Model {}

Abogado.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  especialidad: { type: DataTypes.STRING(120), allowNull: false },
  ciudad: { type: DataTypes.STRING(120), allowNull: false },
  experiencia: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  rating: { type: DataTypes.FLOAT.UNSIGNED, allowNull: false, defaultValue: 0 },
  casos_ganados: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  telefono: { type: DataTypes.STRING(50) },
  email_publico: { type: DataTypes.STRING(160) },
  foto_url: { type: DataTypes.TEXT },
  descripcion: { type: DataTypes.TEXT },
  idiomas: { type: DataTypes.STRING(255) }, /* CSV simple p/ MVP */
  educacion: { type: DataTypes.STRING(255) }
}, { sequelize, tableName: 'abogados' });

Usuario.hasOne(Abogado, { foreignKey: 'usuario_id', as: 'perfil' });
Abogado.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
