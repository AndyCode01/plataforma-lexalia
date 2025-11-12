# 🚀 Guía Paso a Paso - Hostinger (lexaliaabogados.com)

## 📋 Resumen
Vamos a desplegar:
- **Frontend React** → lexaliaabogados.com
- **Backend Node.js** → lexaliaabogados.com/api (mismo dominio)
- **Base de Datos MySQL** → Hostinger (ya tienes: u386022867_lsnt9)

---

## ✅ PASO 1: Preparar archivos en tu PC

### 1.1 Exportar la base de datos local
Abre PowerShell en tu PC y ejecuta:

```powershell
docker exec -it lexalia-db mysqldump -uroot -proot lexalia > lexalia_backup.sql
```

Esto crea un archivo `lexalia_backup.sql` con toda tu base de datos (tablas + datos).

### 1.2 Compilar el frontend
En la raíz del proyecto:

```powershell
npm run build
```

Esto genera la carpeta `dist/` con el frontend listo para producción.

---

## ✅ PASO 2: Configurar Hostinger (hPanel)

### 2.1 Verificar tu base de datos

1. En hPanel → **Bases de datos MySQL**
2. Anota estos datos (ya los tienes, verifica):
   - **Nombre de la base:** `u386022867_lsnt9` (el tuyo exacto)
   - **Usuario:** `u386022867_d0yvc` (el tuyo exacto)
   - **Contraseña:** (si no la recuerdas, haz clic en el ícono de editar y cámbiala)
   - **Host:** `localhost`

---

## ✅ PASO 3: Importar la base de datos

### 3.1 Acceder a phpMyAdmin
1. En hPanel → **Bases de datos MySQL** → clic en **Ingresar a phpMyAdmin**
2. Selecciona tu base de datos en el panel izquierdo (ej: `u386022867_lsnt9`)

### 3.2 Importar el backup
1. Clic en la pestaña **Importar**
2. Clic en **Seleccionar archivo** → elige `lexalia_backup.sql`
3. Deja todo por defecto
4. Clic en **Continuar**
5. Espera a que termine (puede tardar unos segundos)

✅ Ahora tu base de datos está lista en Hostinger.

---

## ✅ PASO 4: Subir el backend (Node.js)

### 4.1 Conectar por FTP o File Manager
Opciones:
- **File Manager** (más fácil): En hPanel → **Archivos** → **Administrador de archivos**
- **FTP** (FileZilla): Usa las credenciales FTP de Hostinger

### 4.2 Subir archivos del backend
1. En File Manager, navega a `/domains/lexaliaabogados.com/public_html`
2. Crea una carpeta llamada `api`
3. Dentro de la carpeta `api`, sube **todos los archivos** de tu carpeta `server/`:
   - `config/`
   - `controllers/`
   - `middleware/`
   - `models/`
   - `routes/`
   - `uploads/` (vacía está bien)
   - `package.json`
   - `package-lock.json`
   - `server.js`

⚠️ **NO subas** la carpeta `node_modules` ni el archivo `.env` (lo crearemos directo en el servidor).

### 4.3 Crear el archivo `.env` en el servidor

**Opción A: Desde File Manager**
1. En la carpeta del backend, clic derecho → **Nuevo archivo**
2. Nombre: `.env`
3. Edita el archivo y pega esto (ajusta tus valores):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u386022867_lsnt9
DB_USER=u386022867_d0yvc
DB_PASS=TU_PASSWORD_AQUI

PORT=4000
NODE_ENV=production
JWT_SECRET=CAMBIA_ESTO_POR_UN_STRING_LARGO_ALEATORIO
CORS_ORIGIN=https://lexaliaabogados.com

MERCADOPAGO_TOKEN=APP_USR-8536330278315916-110402-80538eb893a9a606a8c546024ca1175c-2964967760
FRONTEND_URL=https://lexaliaabogados.com
BACKEND_URL=https://lexaliaabogados.com
```

**Opción B: Desde SSH** (si prefieres terminal)
1. En hPanel → **Avanzado** → **Terminal SSH**
2. Ejecuta:
```bash
cd domains/lexaliaabogados.com/public_html/api
nano .env
```
3. Pega el contenido de arriba, ajusta valores, guarda con `Ctrl+O`, `Enter`, `Ctrl+X`

**Genera un JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ PASO 5: Configurar aplicación Node.js en Hostinger

### 5.1 Crear aplicación Node
1. En hPanel → **Avanzado** → **Node.js**
2. Clic en **Crear aplicación**
3. Configuración:
   - **Versión Node.js:** 18.x o 20.x (la más reciente LTS)
   - **Modo de aplicación:** Producción
   - **Ruta de la aplicación:** `/domains/lexaliaabogados.com/public_html/api`
   - **Archivo de inicio de aplicación:** `server.js`
   - **Puerto de aplicación:** `4000` (debe coincidir con PORT en tu `.env`)
   - **Variables de entorno:** déjalas vacías (ya tienes el `.env`)
4. Clic en **Crear**

### 5.2 Instalar dependencias
Desde el panel de Node.js o desde SSH:

**Opción A: Desde el panel**
- Busca un botón **"Run npm install"** o similar (depende de la versión de hPanel)

**Opción B: Desde SSH**
```bash
cd domains/lexaliaabogados.com/public_html/api
npm install --production
```

Esto instalará todas las dependencias del `package.json` (express, sequelize, mysql2, etc).

### 5.3 Iniciar la aplicación
1. En hPanel → **Node.js** → encuentra tu aplicación
2. Clic en **Iniciar** (o **Start**)
3. Espera unos segundos

✅ Tu backend ahora está corriendo en Node.js (puerto 4000 interno)

---

## ✅ PASO 6: Configurar proxy para /api

### 6.1 Crear/editar .htaccess en public_html

1. En File Manager, navega a `/domains/lexaliaabogados.com/public_html`
2. Si ya existe `.htaccess`, edítalo. Si no, créalo.
3. El contenido debe ser:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Proxy para API → redirige /api a Node.js en puerto 4000
  RewriteCond %{REQUEST_URI} ^/api
  RewriteRule ^api/(.*)$ http://localhost:4000/api/$1 [P,L]
  
  # Archivos uploads
  RewriteCond %{REQUEST_URI} ^/uploads
  RewriteRule ^uploads/(.*)$ api/uploads/$1 [L]
  
  # SPA fallback para React Router
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

⚠️ **Importante:** La regla `[P]` (proxy) requiere `mod_proxy` en Apache. Si ves error 500, significa que no está habilitado.

**Alternativa si no funciona el proxy:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Archivos uploads
  RewriteCond %{REQUEST_URI} ^/uploads
  RewriteRule ^uploads/(.*)$ api/uploads/$1 [L]
  
  # SPA fallback para React Router
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Y tendrás que crear un subdominio después de todo (si el proxy falla).

---

## ✅ PASO 7: Verificar el backend

Abre en tu navegador:
Abre en tu navegador:
```
https://lexaliaabogados.com/api/health
```

**Debes ver:**
```json
{"ok":true}
```

Si ves esto: ✅ **¡Perfecto! El backend está funcionando.**

**Si da error 500:**
- El `.htaccess` tiene el proxy `[P]` pero `mod_proxy` no está habilitado
- Solución: Contacta soporte de Hostinger para activar `mod_proxy` O usa un subdominio diferente

**Si da error 502 o no carga:**
- Ve a hPanel → Node.js → Logs (busca errores)
- Revisa que el `.env` tenga las credenciales correctas
- Verifica que `npm install` haya terminado sin errores
- Reinicia la aplicación desde el panel Node.js

---

## ✅ PASO 8: Subir el frontend

### 8.1 Conectar al dominio principal
1. En File Manager, navega a `/domains/lexaliaabogados.com/public_html`
2. **NO borres** la carpeta `api` que creaste antes
3. Si hay archivos de prueba (index.html viejo), bórralos

### 8.2 Subir el build de React
1. Sube **TODO el contenido** de la carpeta `dist/` que compilaste antes:
   - `index.html`
   - Carpeta `assets/` (con archivos .js y .css)
   - Cualquier otro archivo generado

⚠️ **Importante:** Sube el **contenido** de `dist/`, NO la carpeta `dist` completa.

### 8.3 El .htaccess ya está configurado
Ya lo creaste en el PASO 6 con las reglas de proxy y SPA fallback.

---

## ✅ PASO 9: Probar la aplicación completa

### 9.1 Abrir el sitio
Ve a: `https://lexaliaabogados.com`

Deberías ver tu plataforma de abogados cargando.

### 9.2 Probar flujos principales
1. **Registrar un abogado:**
   - Ve a registro de abogado
   - Completa el formulario
   - Debería procesarse y mostrarte éxito

2. **Iniciar sesión:**
   - Ve a login
   - Usa las credenciales de un usuario registrado

3. **Panel de administración:**
   - Necesitas un usuario admin (lo creamos en el siguiente paso)

---

## ✅ PASO 10: Crear usuario administrador

### 10.1 Desde phpMyAdmin
1. hPanel → **phpMyAdmin**
2. Selecciona tu base de datos
3. Clic en **SQL**
4. Pega y ejecuta:

```sql
INSERT INTO usuarios (nombre, email, password, rol, activo, estado_pago, plan, createdAt, updatedAt) 
VALUES ('Admin', 'admin@lexalia.com', '$2a$10$ZCNF/xJPXvw8zW/YjZJmG.nLqNVQE/VuEUdlxIQmXGKgXMXQzS9uy', 'admin', 1, 'aprobado', 'premium', NOW(), NOW());
```

### 10.2 Iniciar sesión como admin
- Email: `admin@lexalia.com`
- Contraseña: `admin123`

✅ Ya puedes acceder al panel de administración desde `/admin`

---

## ✅ PASO 11: Configuración adicional (opcional)

### 11.1 SSL/HTTPS
Hostinger normalmente activa SSL automáticamente. Verifica:
1. hPanel → **Avanzado** → **SSL**
2. Asegúrate de que `lexaliaabogados.com` tenga SSL activo
3. Si no, actívalo (es gratis con Let's Encrypt)

### 11.2 Configurar MercadoPago para producción
Cuando quieras cobrar de verdad:
1. Ve a tu cuenta de MercadoPago → Credenciales
2. Copia el **Access Token de PRODUCCIÓN** (no el de prueba)
3. Edita el `.env` del backend y reemplaza `MERCADOPAGO_TOKEN`
4. Reinicia la aplicación Node desde hPanel

### 11.3 Permisos de uploads
Si las fotos de perfil no se suben, desde SSH:
```bash
cd domains/lexaliaabogados.com/public_html/api
chmod 755 uploads
```

---

## 🎯 Checklist final

Marca cada paso que completes:

- [ ] Base de datos importada en Hostinger
- [ ] Archivos del backend subidos a `/public_html/api`
- [ ] Archivo `.env` creado con credenciales correctas
- [ ] Aplicación Node.js creada en hPanel
- [ ] Dependencias instaladas (`npm install --production`)
- [ ] Aplicación Node.js iniciada
- [ ] Archivo `.htaccess` con proxy configurado
- [ ] Backend responde en `https://lexaliaabogados.com/api/health`
- [ ] Frontend compilado (`npm run build`)
- [ ] Contenido de `dist/` subido a `public_html/` del dominio principal
- [ ] Sitio carga correctamente en `https://lexaliaabogados.com`
- [ ] Usuario admin creado
- [ ] SSL activo
- [ ] Flujos probados (registro, login, admin)

---

## 🔧 Solución de problemas comunes

### Error 502 Bad Gateway en la API
**Causa:** La aplicación Node no está corriendo.
**Solución:**
1. hPanel → Node.js → verifica el estado
2. Si está detenida, haz clic en **Iniciar**
3. Revisa los logs para ver errores

### Error de conexión a base de datos
**Causa:** Credenciales incorrectas en `.env`
**Solución:**
1. Verifica que `DB_NAME`, `DB_USER`, `DB_PASS` sean exactos
2. Sin espacios extras
3. Reinicia la aplicación Node después de editar `.env`

### CORS errors en el navegador
**Causa:** El frontend no puede comunicarse con el backend.
**Solución:**
1. Verifica que `CORS_ORIGIN=https://lexaliaabogados.com` en el `.env` del backend
2. Reinicia la aplicación Node
3. Verifica que `.env.production` del frontend tenga `VITE_API_URL=https://lexaliaabogados.com`

### Página en blanco o 404 en rutas del frontend
**Causa:** `.htaccess` mal configurado o faltante.
**Solución:**
1. Verifica que `.htaccess` exista en `public_html/`
2. Copia el contenido del Paso 7.3

### Las imágenes de perfil no se suben
**Causa:** Permisos incorrectos en carpeta uploads.
**Solución:**
```bash
chmod 755 domains/api.lexaliaabogados.com/public_html/uploads
```

---

## 📞 ¿Necesitas ayuda?

Si algo no funciona:
1. Revisa los **logs** en hPanel → Node.js
2. Abre la **consola del navegador** (F12) para ver errores
3. Verifica que todos los archivos `.env` tengan valores correctos
4. Asegúrate de que las URLs en el frontend y backend coincidan

¡Listo! Tu plataforma Lexalia está en producción en Hostinger. 🎉
