import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'lexalia';

console.log('🔧 Configuración de DB:', {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  database: DB_NAME
});

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    freezeTableName: true,
    underscored: true,
  }
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida');
  } catch (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    throw err;
  }
}
