# Lexalia - Plataforma de Abogados

Plataforma web para conectar usuarios con abogados especializados. Sistema de registro con pagos integrados vía Mercado Pago.

## 🚀 Características

- **Catálogo de Abogados**: Búsqueda y filtrado por especialidad, ciudad y calificación
- **Consultas**: Sistema de preguntas y respuestas entre usuarios y abogados
- **Gestión de Suscripciones**: Dashboard para abogados con estado de pago y renovación
- **Pagos Integrados**: Procesamiento de pagos mediante Mercado Pago
- **Perfiles Personalizados**: Gestión de perfiles para abogados y usuarios
- **Panel Administrativo**: Gestión de usuarios y control de la plataforma

## 🛠️ Tecnologías

### Frontend
- React 19
- Vite
- TailwindCSS
- React Router DOM

### Backend
- Node.js + Express
- Sequelize ORM
- MySQL 8.0
- JWT Authentication
- bcrypt para hashing de contraseñas

### Infraestructura
- Docker + Docker Compose
- Nginx (reverse proxy)
- Certbot (SSL certificates)

## 📦 Instalación

### Requisitos Previos
- Node.js 18+
- Docker y Docker Compose
- ngrok (para webhooks de Mercado Pago en desarrollo)

### Configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd plataforma-abogados
```

2. **Configurar variables de entorno**

Crear `server/.env` basado en `server/.env.example`:
```bash
cp server/.env.example server/.env
```

Editar `server/.env` con tus credenciales:
- `JWT_SECRET`: Clave secreta para JWT
- `MERCADOPAGO_TOKEN`: Token de acceso de Mercado Pago
- `FRONTEND_URL`: URL del frontend
- `BACKEND_URL`: URL pública del backend (ngrok en desarrollo)

3. **Instalar dependencias**
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

4. **Iniciar servicios con Docker**
```bash
docker compose up -d
```

5. **Iniciar frontend en desarrollo**
```bash
npm run dev
```

6. **Configurar ngrok para webhooks** (desarrollo)
```bash
ngrok http 3000
```

Actualizar `BACKEND_URL` en `server/.env` con la URL de ngrok.

## 🗄️ Base de Datos

### Migraciones

Las migraciones SQL están en `server/migrations/`:
- `add_consultas.sql`: Crea tablas de consultas y respuestas

### Estructura de Tablas

- **usuarios**: Usuarios y abogados del sistema
- **abogados**: Perfiles extendidos de abogados
- **consultas**: Preguntas de usuarios
- **respuestas**: Respuestas de abogados a consultas
- **planes**: Planes de suscripción para abogados

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT con expiración
- CORS configurado
- Variables de entorno para credenciales
- `.gitignore` configurado para proteger datos sensibles

**Archivos protegidos:**
- `server/.env` (credenciales)
- `server/uploads/` (archivos subidos)
- `*.sql` (backups de base de datos)
- `ngrok.exe`

## 🚦 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios/abogados
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Perfil del usuario autenticado

### Abogados
- `GET /api/abogados` - Listar abogados
- `GET /api/abogados/:id` - Detalles de un abogado
- `PUT /api/abogados/:id` - Actualizar perfil (autenticado)

### Consultas
- `GET /api/consultas` - Listar consultas
- `POST /api/consultas` - Crear consulta (usuarios)
- `POST /api/respuestas` - Responder consulta (abogados)

### Mercado Pago
- `POST /api/mercadopago/crear-preferencia` - Crear orden de pago
- `POST /api/mercadopago/webhook` - Webhook de notificaciones
- `GET /api/mercadopago/estado/:userId` - Estado de suscripción
- `POST /api/mercadopago/renovar` - Renovar suscripción

### Admin
- `GET /api/admin/usuarios` - Listar usuarios (admin)
- `PUT /api/admin/usuarios/:id/activar` - Activar/desactivar usuario

## 📱 Uso

### Registro de Usuario Normal
1. Ir a "Registrarse"
2. Seleccionar rol "Usuario"
3. Llenar formulario
4. Acceso inmediato tras registro

### Registro de Abogado
1. Ir a "Registrarse"
2. Seleccionar rol "Abogado"
3. Llenar formulario completo
4. Procesar pago de $100,000 COP
5. Esperar confirmación automática (3-5 segundos)
6. Acceso tras aprobación del pago

### Sistema de Consultas
1. Usuario autenticado crea consulta
2. Abogados activos pueden responder
3. Notificaciones en tiempo real (futuro)

## 🔄 Flujo de Renovación

- Las suscripciones duran 30 días
- Verificación automática cada hora
- Estados: `pendiente`, `aprobado`, `rechazado`, `expirado`
- Dashboard de suscripción para renovar

## 🧪 Testing

```bash
# Backend
cd server
npm test

# Frontend
npm test
```

## 📝 Licencia

Este proyecto es privado y confidencial.

## 👥 Contribución

Proyecto en desarrollo activo. No se aceptan contribuciones externas.

---

**Última actualización**: Febrero 2026

