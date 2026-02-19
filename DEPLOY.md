# Deployment Guía - Lexalia VPS

## 📋 Requisitos Previos

- VPS con Ubuntu 20.04+ (Hostinger)
- IP: `187.77.202.167`
- Dominio: `andreitus.online` (apuntando a la IP)
- SSH acceso al VPS
- Docker y Docker Compose instalados

## 🔧 Instalación en el VPS

### 1. Conectar al VPS via SSH

```bash
ssh root@187.77.202.167
# O si tienes clave SSH
ssh -i /ruta/a/key.pem root@187.77.202.167
```

### 2. Preparar el servidor

```bash
# Actualizar paquetes
apt update && apt upgrade -y

# Instalar dependencias necesarias
apt install -y curl wget git

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

### 3. Clonar repositorio

```bash
cd /home
git clone https://github.com/AndyCode01/plataforma-lexalia.git
cd plataforma-lexalia
```

### 4. Configurar variables de entorno

```bash
# Copiar archivo de producción
cp server/.env.production server/.env

# Editar con contraseñas seguras
nano server/.env
```

**⚠️ IMPORTANTE - Cambiar en `server/.env`:**
- `DB_PASS` → Contraseña segura para MySQL
- `JWT_SECRET` → Clave aleatoria segura
- `MERCADOPAGO_TOKEN` → Tu token real

### 5. Build del frontend para producción

```bash
# Instalar dependencias
npm install

# Compilar React
npm run build

# El resultado estará en ./dist
```

### 6. Crear carpetas necesarias para SSL

```bash
mkdir -p docker/nginx/ssl
mkdir -p docker/nginx/www

# IMPORTANTE: Copiar .env a la raíz para docker-compose
cp server/.env .env
```

### 7. Iniciar SSL (Let's Encrypt)

```bash
# Obtener certificado SSL
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  --email andres.gamer1998@gmail.com \
  -d andreitus.online \
  -d www.andreitus.online \
  --agree-tos \
  --non-interactive
```

### 8. Iniciar servicios

```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d

# Verificar que todo está corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 9. Verificar funcionamiento

```bash
# Verificar API
curl https://andreitus.online/api/health

# Verificar que está accesible
# Abre en navegador: https://andreitus.online
```

## 🔄 Actualizaciones Futuras

Cuando hagas cambios y quieras actualizar en el VPS:

```bash
# En tu PC
git push origin main

# En el VPS
cd /home/plataforma-lexalia
git pull origin main

# Rebuild solo si hay cambios en Server
docker-compose -f docker-compose.prod.yml build api --no-cache

# Rebuild solo si hay cambios en Frontend
npm run build

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Seguridad

- ✅ SSL/HTTPS obligatorio
- ✅ Nginx con proxy reverso
- ✅ Variables de entorno protegidas
- ✅ Renovación automática de certificados

## 📊 Monitoreo

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f api

# Ver logs de BD
docker-compose -f docker-compose.prod.yml logs -f db

# Ver logs de Nginx
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## 🆘 Troubleshooting

### SSL no funciona
```bash
# Verificar certificado
docker-compose -f docker-compose.prod.yml exec certbot ls -la /etc/letsencrypt/live/

# Verificar permisos
docker-compose -f docker-compose.prod.yml exec nginx ls -la /etc/letsencrypt/live/

# Renovar certificado
docker-compose -f docker-compose.prod.yml run --rm certbot certonly --force-renewal \
  -d andreitus.online -d www.andreitus.online
```

### API no conecta a MySQL
```bash
# Verificar que la BD está corriendo
docker-compose -f docker-compose.prod.yml ps

# Verificar credenciales en .env
cat server/.env | grep DB_PASS

# Probar conexión a MySQL
docker-compose -f docker-compose.prod.yml exec db mysql -uroot -p$DB_PASS -e "SELECT 1"

# Ver logs del API
docker-compose -f docker-compose.prod.yml logs -f api

# Ver logs de MySQL
docker-compose -f docker-compose.prod.yml logs -f db
```

### Si nada funciona, reiniciar todo
```bash
# Detener servicios
docker-compose -f docker-compose.prod.yml down

# Actualizar código
git pull origin main

# Reconstruir
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Notas Importantes

- Local sigue usando `docker-compose.yml` + ngrok (sin cambios)
- Producción usa `docker-compose.prod.yml` + SSL real
- El archivo `.env.production` no se versionará (en .gitignore)
- Se recomienda hacer backups regulares de la BD

---

**Última actualización:** Febrero 2026
