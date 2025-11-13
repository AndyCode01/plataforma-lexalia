import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Usuario extends Model {}

Usuario.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING(200), allowNull: false },
  rol: { type: DataTypes.ENUM('admin', 'abogado'), allowNull: false, defaultValue: 'abogado' },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  estado_pago: { type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'), allowNull: false, defaultValue: 'pendiente' },
  fecha_activacion: { type: DataTypes.DATE },
  fecha_expiracion: { type: DataTypes.DATE },
  plan: { type: DataTypes.ENUM('basico', 'pro', 'premium'), allowNull: false, defaultValue: 'basico' }
}, { sequelize, tableName: 'usuarios' });
