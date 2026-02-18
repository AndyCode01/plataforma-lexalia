import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import fs from 'fs';

// Internal imports
import { connectDB, sequelize } from './config/database.js';
import { defineModelRelationships } from './config/relationships.js';
import { CORS_CONFIG, PORT, DB_CONFIG } from './config/constants.js';

// Routes imports
import authRoutes from './routes/auth.js';
import abogadosRoutes from './routes/abogados.js';
import mercadoPagoRoutes from './routes/mercadopago.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import consultasRoutes from './routes/consultas.js';
import { verificarSuscripcionesExpiradas } from './tasks/subscriptionChecker.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors(CORS_CONFIG));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define model relationships
defineModelRelationships();

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/abogados', abogadosRoutes);
app.use('/api/mercadopago', mercadoPagoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/admin', adminRoutes);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (maxRetries = 20, delayMs = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await connectDB();
      await sequelize.sync(DB_CONFIG.syncOptions);
      console.log('✅ Base de datos sincronizada');
      return;
    } catch (err) {
      console.error(`❌ Error conectando a MySQL (intento ${attempt}/${maxRetries}):`, err.message);
      if (attempt === maxRetries) {
        throw err;
      }
      await sleep(delayMs);
    }
  }
};

// Start server with HTTPS support
const start = async () => {
  try {
    await connectWithRetry();
    
    // Iniciar verificación automática de suscripciones expiradas cada hora
    setInterval(verificarSuscripcionesExpiradas, 60 * 60 * 1000); // Cada hora
    // Ejecutar una verificación inicial al iniciar
    await verificarSuscripcionesExpiradas();
    console.log('⏰ Tarea automática de verificación de suscripciones activada');
    
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const DOMAIN = process.env.DOMAIN || 'localhost';
    
    // Path to SSL certificates (Let's Encrypt)
    const certPath = `/etc/letsencrypt/live/${DOMAIN}/fullchain.pem`;
    const keyPath = `/etc/letsencrypt/live/${DOMAIN}/privkey.pem`;
    const isProduction = NODE_ENV === 'production' && fs.existsSync(certPath) && fs.existsSync(keyPath);

    if (isProduction) {
      // HTTPS in production
      const options = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      };

      https.createServer(options, app).listen(PORT, () => {
        console.log(`✅ API escuchando en https://${DOMAIN}:${PORT}`);
      });

      // HTTP redirect to HTTPS (port 80)
      http.createServer((req, res) => {
        res.writeHead(301, {
          Location: `https://${DOMAIN}${req.url}`,
        });
        res.end();
      }).listen(80, () => {
        console.log(`🔄 HTTP redirección activa (80 → 443)`);
      });
    } else {
      // HTTP in development
      app.listen(PORT, () => {
        console.log(`✅ API escuchando en http://localhost:${PORT}`);
      });
    }
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

start();
