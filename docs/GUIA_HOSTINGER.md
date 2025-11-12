# Despliegue en Hostinger - Plataforma Lexalia

## Opción 1: Hostinger Business/Cloud (Con Node.js) ✅

### Requisitos
- Plan Hostinger Business, Cloud o VPS
- Acceso a SSH
- Node.js habilitado en tu plan

### Paso 1: Preparar Archivos

#### 1.1 Crear `.htaccess` en la raíz del frontend compilado
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Paso 2: Configurar Variables de Entorno

Crea `server/.env` en producción:
```env
DB_HOST=localhost
DB_USER=u123456789_lexalia
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_NAME=u123456789_lexalia
DB_PORT=3306
JWT_SECRET=tu-secreto-super-seguro-aleatorio
MERCADOPAGO_ACCESS_TOKEN=TU_TOKEN_MERCADOPAGO
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://tudominio.com
PORT=3000
NODE_ENV=production
```

### Paso 3: Subir Archivos vía FTP/SFTP

#### 3.1 Estructura en Hostinger:
```
public_html/
├── backend/              # Carpeta para el servidor Node.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── uploads/
└── (archivos compilados de React aquí)
    ├── index.html
    ├── assets/
    └── .htaccess
```

#### 3.2 Compilar y subir Frontend
En tu PC:
```powershell
npm run build
```

Sube todo el contenido de `dist/` a `public_html/`

#### 3.3 Subir Backend
Sube toda la carpeta `server/` a `public_html/backend/`

### Paso 4: Configurar Node.js en Hostinger

1. Inicia sesión en hPanel de Hostinger
2. Ve a **Avanzado** → **Node.js**
3. Haz clic en **Crear aplicación**
4. Configuración:
   - **Versión Node.js:** 18.x o superior
   - **Modo de aplicación:** Producción
   - **Ruta de la aplicación:** `/home/u123456789/domains/tudominio.com/public_html/backend`
   - **Archivo de inicio:** `server.js`
   - **Puerto:** 3000 (o el que te asigne Hostinger)
5. Guarda y inicia la aplicación

### Paso 5: Instalar Dependencias vía SSH

Conéctate por SSH (en hPanel → SSH Access):
```bash
cd domains/tudominio.com/public_html/backend
npm install --production
```

### Paso 6: Configurar Proxy Reverso

Crea `.htaccess` en `public_html/` para redirigir peticiones API al backend:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Redirigir /api al backend Node.js
  RewriteCond %{REQUEST_URI} ^/api
  RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
  
  # Servir archivos estáticos de uploads
  RewriteCond %{REQUEST_URI} ^/uploads
  RewriteRule ^(.*)$ backend/$1 [L]
  
  # React Router - redirigir todo lo demás a index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Paso 7: Configurar Base de Datos MySQL

1. En hPanel → **Bases de datos** → **Administrar**
2. Crea una nueva base de datos (ej: `u123456789_lexalia`)
3. Crea un usuario y asigna permisos
4. Importa el schema:
   - Descarga `phpMyAdmin` desde hPanel
   - Importa el archivo SQL generado desde tu Docker local

#### Exportar schema desde tu PC:
```powershell
docker exec -it lexalia-db mysqldump -uroot -proot lexalia > lexalia_backup.sql
```

### Paso 8: Crear Usuario Admin en Producción

Desde phpMyAdmin en Hostinger, ejecuta:
```sql
INSERT INTO usuarios (nombre, email, password, rol, activo, estado_pago, plan, createdAt, updatedAt) 
VALUES ('Admin', 'admin@lexalia.com', '$2a$10$ZCNF/xJPXvw8zW/YjZJmG.nLqNVQE/VuEUdlxIQmXGKgXMXQzS9uy', 'admin', 1, 'aprobado', 'premium', NOW(), NOW());
```

### Paso 9: Actualizar Frontend para usar dominio

En `src/services/api.js`, asegúrate de que `API_BASE` use tu dominio:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'https://tudominio.com';
```

Recompila y vuelve a subir:
```powershell
npm run build
```

---

## Opción 2: Hostinger Básico (Sin Node.js) ⚠️

Si NO tienes Node.js disponible, usa servicios externos:

### Frontend en Hostinger + Backend en Railway

1. **Frontend (React compilado):**
   - Compila: `npm run build`
   - Sube `dist/` a `public_html/`
   - Agrega `.htaccess` para React Router

2. **Backend (Node.js) en Railway:**
   - Sigue la guía de Railway de `GUIA_DEPLOYMENT.md`
   - La base de datos puede estar en Hostinger (MySQL)

3. **Conectar ambos:**
   - Backend en Railway apunta a MySQL de Hostinger
   - Frontend usa variable `VITE_API_URL=https://tu-backend.railway.app`

#### Variables de entorno en Railway:
```env
DB_HOST=mysql.hostinger.com
DB_USER=u123456789_lexalia
DB_PASSWORD=TU_PASSWORD_HOSTINGER
DB_NAME=u123456789_lexalia
DB_PORT=3306
FRONTEND_URL=https://tudominio.com
```

#### Permitir conexiones externas en MySQL de Hostinger:
1. hPanel → **Bases de datos** → **Acceso remoto de MySQL**
2. Agrega la IP de Railway (o usa `%` para permitir todas - menos seguro)

---

## ¿Qué plan de Hostinger tienes?

### Para verificar si tienes Node.js disponible:
1. Inicia sesión en hPanel
2. Busca en el menú lateral: **Avanzado** → **Node.js**
3. Si aparece, ¡puedes usar la Opción 1!
4. Si NO aparece, usa la Opción 2 (Frontend en Hostinger + Backend en Railway)

---

## Comandos útiles SSH (Hostinger Business/Cloud)

### Reiniciar aplicación Node.js:
```bash
cd ~/domains/tudominio.com/public_html/backend
pm2 restart all
```

### Ver logs:
```bash
pm2 logs
```

### Actualizar código:
```bash
cd ~/domains/tudominio.com/public_html/backend
git pull origin main
npm install --production
pm2 restart all
```

---

## Troubleshooting

### Error 502 Bad Gateway
- Verifica que la aplicación Node.js esté corriendo en hPanel
- Revisa logs en SSH: `pm2 logs`

### Base de datos no conecta
- Verifica credenciales en `.env`
- En Hostinger, el host suele ser `localhost` o `mysql.hostinger.com`

### CORS errors
- Actualiza `FRONTEND_URL` en `.env`
- Verifica que `server.js` use `process.env.FRONTEND_URL` en CORS

---

**¿Qué plan de Hostinger tienes? (Básico/Business/Cloud/VPS)**

Te ayudo con la configuración específica según tu plan.
