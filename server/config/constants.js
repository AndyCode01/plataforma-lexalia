// CORS Configuration
export const ALLOWED_ORIGINS = [
  'https://lexaliaabogados.com',
  'https://www.lexaliaabogados.com',
  'http://lexaliaabogados.com',
  'http://www.lexaliaabogados.com',
  'http://localhost:5173',     // Frontend local development
  'http://localhost:3000',     // API local development
  'http://localhost:4000',     // API local (alternative port)
];

export const CORS_CONFIG = {
  origin: function (origin, callback) {
    // Allow requests without origin (like Postman) or from allowed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
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
