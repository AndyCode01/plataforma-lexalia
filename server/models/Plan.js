import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Abogado } from './Abogado.js';

export class Plan extends Model {}

Plan.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  abogado_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  tipo: { type: DataTypes.ENUM('basico', 'pro', 'premium'), allowNull: false, defaultValue: 'basico' },
  fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_fin: { type: DataTypes.DATEONLY, allowNull: true },
  estado: { type: DataTypes.ENUM('activo', 'suspendido', 'vencido'), allowNull: false, defaultValue: 'activo' },
  referencia_pago: { type: DataTypes.STRING(100) },
  estado_pago: { type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'), allowNull: false, defaultValue: 'pendiente' }
}, { sequelize, tableName: 'planes' });

Abogado.hasMany(Plan, { foreignKey: 'abogado_id', as: 'planes' });
Plan.belongsTo(Abogado, { foreignKey: 'abogado_id', as: 'abogado' });
