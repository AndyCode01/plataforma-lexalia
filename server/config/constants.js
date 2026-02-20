// server/config/constants.js

const normalizeOrigin = (o = '') => o.replace(/\/$/, '').toLowerCase();

// CORS Configuration
export const ALLOWED_ORIGINS = [
  'https://lexaliaabogados.com',
  'https://www.lexaliaabogados.com',
  'https://andreitus.online',
  'https://www.andreitus.online',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:4000',
].map(normalizeOrigin);

export const CORS_CONFIG = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // Postman/curl
    const normalized = normalizeOrigin(origin);

    if (ALLOWED_ORIGINS.includes(normalized)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked request from: ${origin}`);
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Server Configuration
export const PORT = process.env.PORT || 4000;
export const DOMAIN = process.env.DOMAIN || 'localhost';
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Database Configuration
export const DB_CONFIG = {
  syncOptions: { alter: true },
};
