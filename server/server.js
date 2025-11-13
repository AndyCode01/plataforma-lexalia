import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import abogadosRoutes from './routes/abogados.js';
import mercadoPagoRoutes from './routes/mercadopago.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, sequelize } from './config/database.js';
import { Usuario } from './models/Usuario.js';
import { Abogado } from './models/Abogado.js';
import { Plan } from './models/Plan.js';

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos subidos (fotos de perfil)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/abogados', abogadosRoutes);
app.use('/api/mercadopago', mercadoPagoRoutes);
app.use('/api/upload', uploadRoutes);
console.log('🔧 Montando rutas de admin en /api/admin...');
app.use('/api/admin', adminRoutes);
console.log('✅ Todas las rutas montadas');

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB();
    // Asociaciones ya están definidas en los modelos; sincronizar con alter para actualizar tablas
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas');
    app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

start();
