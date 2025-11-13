import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Respuesta extends Model {}

Respuesta.init({
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  consulta_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: false,
    references: {
      model: 'consultas',
      key: 'id'
    }
  },
  abogado_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  contenido: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  }
}, { 
  sequelize, 
  tableName: 'respuestas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
