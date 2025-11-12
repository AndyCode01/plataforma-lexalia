# Guía de Despliegue - Plataforma Lexalia

> Nota: Si vas a usar Hostinger Business para todo (frontend + Node.js + MySQL), sigue el archivo DEPLOY_HOSTINGER.md. Esta guía de Railway es OPCIONAL, por si prefieres un despliegue gratis sin usar tu hosting. Puedes ignorarla si ya decidiste Hostinger.

## 📦 Opción Recomendada: Railway (Todo Gratis)

Railway te permite desplegar backend, base de datos y frontend en un solo lugar sin pagar VPS.

### Paso 1: Preparar el Proyecto

#### 1.1 Crear archivo `.gitignore` en la raíz
```
node_modules/
.env
server/node_modules/
server/.env
server/uploads/
.DS_Store
*.log
```

#### 1.2 Crear `Procfile` en la carpeta `server/`
```
web: node server.js
```

#### 1.3 Actualizar `server/package.json` - agregar script start:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### 1.4 Variables de entorno para producción
Crea `server/.env.example` (para documentar):
```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=3306
JWT_SECRET=
MERCADOPAGO_ACCESS_TOKEN=
FRONTEND_URL=
BACKEND_URL=
PORT=4000
```

### Paso 2: Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit - Plataforma Lexalia"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/plataforma-abogados.git
git push -u origin main
```

### Paso 3: Desplegar en Railway

#### 3.1 Crear cuenta en Railway
1. Ve a https://railway.app
2. Regístrate con GitHub
3. Conecta tu repositorio

#### 3.2 Crear Base de Datos MySQL
1. En Railway, haz clic en "+ New"
2. Selecciona "Database" → "MySQL"
3. Anota las credenciales que te da (host, user, password, database)

#### 3.3 Desplegar Backend
1. Haz clic en "+ New" → "GitHub Repo"
2. Selecciona tu repositorio
3. En "Settings":
   - **Root Directory:** `server`
   - **Start Command:** `node server.js`
4. En "Variables", agrega:
   ```
   DB_HOST=<host de Railway>
   DB_USER=<usuario de Railway>
   DB_PASSWORD=<password de Railway>
   DB_NAME=<nombre DB de Railway>
   DB_PORT=3306
   JWT_SECRET=tu-secreto-super-seguro-aleatorio-largo
   MERCADOPAGO_ACCESS_TOKEN=<tu token>
   FRONTEND_URL=https://tu-app.vercel.app
   BACKEND_URL=https://tu-backend.railway.app
   PORT=4000
   ```
5. Railway desplegará automáticamente
6. Anota la URL de tu backend (ej: `https://plataforma-backend.railway.app`)

#### 3.4 Desplegar Frontend en Vercel
1. Ve a https://vercel.com
2. Conecta con GitHub
3. Importa tu repositorio
4. Configura:
   - **Root Directory:** deja en blanco (raíz)
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. En "Environment Variables", agrega:
   ```
   VITE_API_URL=https://tu-backend.railway.app
   ```
6. Deploy!
7. Vercel te dará una URL (ej: `https://lexalia.vercel.app`)

#### 3.5 Actualizar CORS y Frontend URL
En Railway (backend), actualiza las variables:
```
FRONTEND_URL=https://lexalia.vercel.app
```

Redeploy el backend para que tome los cambios.

### Paso 4: Migrar la Base de Datos

Desde tu computadora, exporta la estructura de la DB:

```powershell
docker exec -it lexalia-db mysqldump -uroot -proot lexalia --no-data > schema.sql
```

Luego, importa a Railway usando un cliente MySQL (ej: MySQL Workbench, TablePlus, o DBeaver):
- Host: `<host de Railway>`
- User: `<user de Railway>`
- Password: `<password de Railway>`
- Database: `<db de Railway>`

Ejecuta el archivo `schema.sql` para crear las tablas.

Para migrar datos existentes (usuarios, abogados):
```powershell
docker exec -it lexalia-db mysqldump -uroot -proot lexalia > backup_completo.sql
```

Importa ese archivo completo a Railway.

### Paso 5: Crear Usuario Admin en Producción

Ejecuta desde tu computadora (conectado a la DB de Railway):

```sql
INSERT INTO usuarios (nombre, email, password, rol, activo, estado_pago, plan, createdAt, updatedAt) 
VALUES ('Admin', 'admin@lexalia.com', '$2a$10$ZCNF/xJPXvw8zW/YjZJmG.nLqNVQE/VuEUdlxIQmXGKgXMXQzS9uy', 'admin', 1, 'aprobado', 'premium', NOW(), NOW());
```

(Password: `admin123`)

---

## 🌐 Opción 2: Hosting Tradicional con cPanel

⚠️ **Solo para frontend estático + MySQL. El backend Node.js NO funcionará.**

Si tu hosting solo tiene PHP/MySQL:

### Alternativa A: Frontend React compilado + Backend en otro lugar
1. Compila React: `npm run build`
2. Sube la carpeta `dist/` a tu hosting
3. Backend en Railway/Render (gratis)
4. MySQL en el hosting tradicional

### Alternativa B: Reescribir backend en PHP
No recomendado - tendrías que reescribir todo el backend de Node.js a PHP.

---

## 📊 Comparación de Opciones

| Servicio | Frontend | Backend | Base de Datos | Costo |
|----------|----------|---------|---------------|-------|
| **Railway** | ❌ | ✅ Node.js | ✅ MySQL | Gratis (500h/mes) |
| **Vercel** | ✅ React | ❌ | ❌ | Gratis ilimitado |
| **Render** | ✅ | ✅ Node.js | ✅ PostgreSQL* | Gratis (750h/mes) |
| **PlanetScale** | ❌ | ❌ | ✅ MySQL | Gratis (5GB) |
| **Hosting cPanel** | ⚠️ Solo estáticos | ❌ | ✅ MySQL | Desde $3/mes |

*Nota: Render ofrece PostgreSQL, no MySQL. Tendrías que migrar o usar PlanetScale aparte.

---

## 🎯 Recomendación Final

**Mejor combinación (GRATIS):**
- **Frontend:** Vercel
- **Backend:** Railway
- **Base de Datos:** Railway (incluida con el backend)

**Pasos resumidos:**
1. Sube código a GitHub
2. Conecta Railway → despliega backend + MySQL
3. Conecta Vercel → despliega frontend
4. Configura variables de entorno en ambos
5. ¡Listo! Tu app está en línea sin pagar VPS

---

## 🔧 Troubleshooting

### Error de CORS
Asegúrate de que en el backend (`server/server.js`):
```javascript
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}));
```

### Base de datos no conecta
Verifica en Railway que las variables `DB_HOST`, `DB_USER`, etc. sean las correctas (Railway las proporciona automáticamente).

### Frontend no llama al backend
Verifica que `VITE_API_URL` en Vercel apunte a tu backend de Railway.

---

## 📝 Notas Importantes

1. **MercadoPago:** Actualiza el `FRONTEND_URL` en las preferencias de pago para que apunte a tu dominio de Vercel.
2. **Uploads:** Las fotos subidas se guardan en el servidor. En Railway, se perderán si reinicias. Para producción, usa **Cloudinary** (gratis hasta 25GB).
3. **Dominio personalizado:** Tanto Vercel como Railway permiten dominios propios gratis (ej: `lexalia.com`).

¿Necesitas ayuda con algún paso específico?
