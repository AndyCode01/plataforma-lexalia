import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Consulta extends Model {}

Consulta.init({
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  usuario_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  titulo: { 
    type: DataTypes.STRING(200), 
    allowNull: false 
  },
  descripcion: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  categoria: { 
    type: DataTypes.ENUM('civil', 'penal', 'laboral', 'familia', 'comercial', 'otro'), 
    allowNull: false,
    defaultValue: 'otro'
  },
  estado: { 
    type: DataTypes.ENUM('abierta', 'respondida', 'cerrada'), 
    allowNull: false, 
    defaultValue: 'abierta' 
  }
}, { 
  sequelize, 
  tableName: 'consultas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
