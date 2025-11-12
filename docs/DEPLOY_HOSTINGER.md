# Guía Paso a Paso - Hostinger Business (lexaliaabogados.com)

## ✅ Pasos a seguir:

### 1. Compilar el Frontend

En tu PC, ejecuta:
```powershell
npm run build
```

Esto genera la carpeta `dist/` con los archivos estáticos de React.

### 2. Crear Base de Datos en Hostinger

1. Inicia sesión en **hPanel** de Hostinger
2. Ve a **Bases de datos** → **Administrar**
3. Crea una nueva base de datos:
   - Nombre: `u123456789_lexalia` (Hostinger agrega el prefijo automáticamente)
   - Usuario: Crea uno o usa uno existente
   - Contraseña: Genera una segura
4. Anota estos datos:
   - Nombre de la base de datos
   - Usuario
   - Contraseña
   - Host (normalmente `localhost`)

### 3. Importar Schema de la Base de Datos

Desde tu PC, exporta la estructura:
```powershell
docker exec -it lexalia-db mysqldump -uroot -proot lexalia > lexalia_backup.sql
```

Luego en Hostinger:
1. Ve a **phpMyAdmin** desde hPanel
2. Selecciona tu base de datos
3. Clic en **Importar**
4. Sube el archivo `lexalia_backup.sql`
5. Ejecuta la importación

### 4. Configurar Node.js en Hostinger

1. En hPanel, ve a **Avanzado** → **Node.js**
2. Clic en **Crear aplicación**
3. Configuración:
   - **Versión de Node.js:** 18.x o 20.x
   - **Modo de aplicación:** Producción
   - **Ruta de la aplicación:** `/home/USUARIO/domains/api.lexaliaabogados.com/public_html` (o `public_html/api` si el subdominio apunta ahí)
   - **Archivo de inicio:** `server.js`
   - **Puerto:** El que te asigne Hostinger (normalmente 3000)

### 5. Subir Archivos por FTP

Usa FileZilla o el File Manager de Hostinger:

**Estructura final en Hostinger:**
```
public_html/
├── api/                    # Backend Node.js
│   ├── server.js
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── .env              # ¡Crear este archivo!
│
├── index.html            # Del build de React
├── assets/               # Del build de React
└── .htaccess            # Para React Router
```

**Qué subir:**
- Carpeta `server/` completa → renombrar a `api/` en Hostinger
- Contenido de `dist/` → raíz de `public_html/`
- Archivo `.htaccess` → raíz de `public_html/`

### 6. Crear archivo .env en el servidor

Conéctate por **SSH** (en hPanel → SSH Access) y crea el archivo:

```bash
cd ~/domains/TU_DOMINIO.com/public_html/api
nano .env
```

Contenido del `.env`:
```env
DB_HOST=localhost
DB_USER=TU_USUARIO_DB
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_NAME=TU_NOMBRE_DB
DB_PORT=3306
JWT_SECRET=genera-un-string-aleatorio-muy-largo-y-seguro
MERCADOPAGO_TOKEN=TEST-XXXXXXXXXXXX
FRONTEND_URL=https://lexaliaabogados.com
BACKEND_URL=https://api.lexaliaabogados.com
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://lexaliaabogados.com
```

Guarda con `Ctrl+O`, `Enter`, `Ctrl+X`

### 7. Instalar Dependencias

Desde SSH:
```bash
cd ~/domains/api.lexaliaabogados.com/public_html
npm install --production
```

### 8. Configurar Proxy Reverso (.htaccess)

Crea/edita `.htaccess` en la raíz de `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Proxy para el backend API
  RewriteCond %{REQUEST_URI} ^/api
  RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
  
  # Servir archivos de uploads
  RewriteCond %{REQUEST_URI} ^/uploads
  RewriteRule ^(.*)$ api/$1 [L]
  
  # React Router - todo lo demás va a index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 9. Iniciar la Aplicación Node.js

1. Vuelve a hPanel → **Node.js**
2. Encuentra tu aplicación
3. Clic en **Iniciar** o **Reiniciar**

### 10. Crear Usuario Admin

Desde **phpMyAdmin** en Hostinger:
```sql
INSERT INTO usuarios (nombre, email, password, rol, activo, estado_pago, plan, createdAt, updatedAt) 
VALUES ('Admin', 'admin@lexalia.com', '$2a$10$ZCNF/xJPXvw8zW/YjZJmG.nLqNVQE/VuEUdlxIQmXGKgXMXQzS9uy', 'admin', 1, 'aprobado', 'premium', NOW(), NOW());
```

(Contraseña: `admin123`)

### 11. Probar la Aplicación

Visita: `https://lexaliaabogados.com`

Deberías ver tu aplicación funcionando. Prueba:
- Registrar un abogado
- Iniciar sesión como admin (`admin@lexalia.com` / `admin123`)
- Acceder al panel de administración

---

## 🔧 Comandos útiles (SSH)

### Ver logs de la aplicación:
```bash
pm2 logs
```

### Reiniciar aplicación:
```bash
pm2 restart all
```

### Ver estado:
```bash
pm2 status
```

### Actualizar código después de cambios:
```bash
cd ~/domains/TU_DOMINIO.com/public_html/api
# Subir nuevos archivos por FTP primero
pm2 restart all
```

---

## ⚠️ Problemas Comunes

### Error 502 Bad Gateway
- Verifica que la app Node.js esté corriendo en hPanel → Node.js
- Revisa logs: `pm2 logs`

### Base de datos no conecta
- Verifica credenciales en `.env`
- El host debe ser `localhost` en Hostinger

### CORS errors
- Asegúrate de que `FRONTEND_URL` en `.env` sea tu dominio correcto
- Verifica que no haya espacios extras en el `.env`

### Uploads no funcionan
- Verifica permisos de la carpeta `uploads`:
   ```bash
   chmod 755 ~/domains/api.lexaliaabogados.com/public_html/uploads
   ```

---

## 📝 Checklist Final

- [ ] Base de datos creada en Hostinger
- [ ] Schema importado
- [ ] Frontend compilado (`npm run build`)
- [ ] Archivos subidos por FTP
- [ ] `.env` creado con credenciales correctas
- [ ] Dependencias instaladas (`npm install --production`)
- [ ] Aplicación Node.js iniciada en hPanel
- [ ] `.htaccess` configurado
- [ ] Usuario admin creado
- [ ] Sitio funcionando en `https://lexaliaabogados.com`

¡Listo! Tu aplicación está en producción en Hostinger.
