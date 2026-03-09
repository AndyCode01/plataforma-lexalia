# 🚀 Guía de Deploy - Lexalia VPS

## 📋 Requisitos Previos

- **VPS** con Ubuntu 20.04+ o Debian 11+
- **Dominio** apuntando a la IP del VPS (Registros A para `dominio.com` y `www.dominio.com`)
- **Acceso SSH** al VPS
- **Puertos abiertos**: 80 (HTTP), 443 (HTTPS), 3000 (API - opcional)

## ✅ Checklist Pre-Deploy

Antes de empezar, verifica:

- [ ] Dominio apuntando correctamente (puede tardar hasta 48h en propagar)
- [ ] Acceso SSH funcionando
- [ ] Token de MercadoPago de **PRODUCCIÓN** (no el de prueba)
- [ ] Backup de base de datos si es migración

---

## 🔧 Instalación en el VPS

### 1️⃣ Conectar al VPS via SSH

```bash
ssh root@TU_IP_DEL_VPS

# Si usas clave SSH:
ssh -i ~/.ssh/tu_clave.pem root@TU_IP_DEL_VPS
```

### 2️⃣ Preparar el servidor

```bash
# Actualizar sistema operativo
apt update && apt upgrade -y

# Instalar dependencias básicas
apt install -y curl wget git nano ufw

# Instalar Docker (método oficial)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version

# Configurar firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 3️⃣ Clonar repositorio

```bash
cd /home
git clone https://github.com/TU_USUARIO/plataforma-lexalia.git
cd plataforma-lexalia
```

### 4️⃣ Configurar variables de entorno

```bash
# Copiar archivo de producción
cp server/.env.production server/.env

# Editar configuración
nano server/.env
```

**⚠️ IMPORTANTE - Cambiar en `server/.env`:**

```bash
# Cambiar el dominio
DOMAIN=tudominio.com
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://tudominio.com

# Generar contraseña segura para MySQL
DB_PASS=$(openssl rand -base64 16)

# Generar clave JWT segura (32 bytes)
JWT_SECRET=$(openssl rand -hex 32)

# Token de MercadoPago de PRODUCCIÓN
MERCADOPAGO_TOKEN=TU_TOKEN_DE_PRODUCCION

# Email para certificados SSL
EMAIL=tu@email.com
```

> **Tip**: Guarda el `DB_PASS` y `JWT_SECRET` generados en un lugar seguro

### 5️⃣ Build del frontend

```bash
# Instalar dependencias de Node
npm install

# Compilar React para producción
npm run build

# Verificar que se creó la carpeta dist/
ls -la dist/
```

### 6️⃣ Inicializar SSL (Let's Encrypt)

**Opción A: Usar script automático (recomendado)**

```bash
chmod +x init-ssl.sh
./init-ssl.sh
```

**Opción B: Manual**

```bash
# Crear directorios
mkdir -p docker/nginx/ssl docker/nginx/www

# Iniciar solo nginx temporalmente
docker-compose -f docker-compose.prod.yml up -d nginx

# Obtener certificado
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  --email tu@email.com \
  -d tudominio.com \
  -d www.tudominio.com \
  --agree-tos \
  --non-interactive

# Si es exitoso, reiniciar todos los servicios
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### 7️⃣ Iniciar todos los servicios

```bash
# Iniciar en modo background
docker-compose -f docker-compose.prod.yml up -d

# Verificar que todos estén corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f
```

### 8️⃣ Verificar funcionamiento

```bash
# Verificar API
curl https://tudominio.com/api/health

# Debería responder: {"ok":true}

# Verificar que el frontend cargue
curl -I https://tudominio.com

# Debería responder: HTTP/2 200
```

Abre en tu navegador: **https://tudominio.com**

---

## 🔄 Actualizaciones y Mantenimiento

### Actualizar código

```bash
cd /home/plataforma-lexalia

# Descargar cambios
git pull origin main

# Si hay cambios en el BACKEND
docker-compose -f docker-compose.prod.yml build api --no-cache
docker-compose -f docker-compose.prod.yml restart api

# Si hay cambios en el FRONTEND
npm install  # Solo si package.json cambió
npm run build
docker-compose -f docker-compose.prod.yml restart nginx

# Si hay cambios en variables de entorno
nano server/.env
docker-compose -f docker-compose.prod.yml restart api

# Ver logs para verificar
docker-compose -f docker-compose.prod.yml logs -f api
```

### Backup de base de datos

```bash
# Crear backup
docker exec lexalia_db mysqldump -u lexalia -p lexalia > backup_$(date +%Y%m%d).sql

# Para restaurar
docker exec -i lexalia_db mysql -u lexalia -p lexalia < backup_20260309.sql
```

### Ver logs

```bash
# Logs de todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Logs solo del API
docker-compose -f docker-compose.prod.yml logs -f api

# Logs solo de la base de datos
docker-compose -f docker-compose.prod.yml logs -f db

# Últimas 100 líneas
docker-compose -f docker-compose.prod.yml logs --tail=100 api
```

### Reiniciar servicios

```bash
# Reiniciar todo
docker-compose -f docker-compose.prod.yml restart

# Reiniciar solo API
docker-compose -f docker-compose.prod.yml restart api

# Reiniciar solo base de datos
docker-compose -f docker-compose.prod.yml restart db

# Detener todo
docker-compose -f docker-compose.prod.yml down

# Iniciar todo de nuevo
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Seguridad

- ✅ SSL/HTTPS automático con Let's Encrypt
- ✅ Renovación automática de certificados cada 60 días
- ✅ Firewall UFW configurado
- ✅ Contraseñas seguras generadas
- ✅ Headers de seguridad en nginx
- ⚠️ **IMPORTANTE**: Cambia las contraseñas por defecto en `server/.env`

---

## 🐛 Troubleshooting

### El certificado SSL falla

**Problema**: Error al obtener certificado

**Soluciones**:
1. Verifica que el dominio apunte correctamente:
   ```bash
   nslookup tudominio.com
   dig tudominio.com
   ```

2. Verifica que el puerto 80 esté abierto:
   ```bash
   netstat -tuln | grep :80
   ```

3. Asegúrate que no haya otro servicio usando el puerto 80:
   ```bash
   docker ps
   systemctl status apache2
   systemctl status nginx
   ```

### La API no responde

**Problema**: `502 Bad Gateway` o `503 Service Unavailable`

**Soluciones**:
1. Verifica que el contenedor API esté corriendo:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

2. Ver logs del API:
   ```bash
   docker-compose -f docker-compose.prod.yml logs api
   ```

3. Verifica conexión a la base de datos:
   ```bash
   docker-compose -f docker-compose.prod.yml logs db
   ```

4. Reinicia el servicio:
   ```bash
   docker-compose -f docker-compose.prod.yml restart api
   ```

### Base de datos no inicia

**Problema**: MySQL no arranca

**Soluciones**:
1. Ver logs de MySQL:
   ```bash
   docker-compose -f docker-compose.prod.yml logs db
   ```

2. Verificar contraseña en `.env`:
   ```bash
   grep DB_PASS server/.env
   ```

3. Eliminar volumen y reiniciar (⚠️ ESTO BORRA LOS DATOS):
   ```bash
   docker-compose -f docker-compose.prod.yml down -v
   docker-compose -f docker-compose.prod.yml up -d
   ```

### MercadoPago no funciona

**Problema**: Pagos no se procesan

**Soluciones**:
1. Verifica el token en `.env`:
   ```bash
   grep MERCADOPAGO_TOKEN server/.env
   ```

2. Asegúrate de usar el token de **PRODUCCIÓN** (no el de prueba)

3. Verifica que el webhook esté configurado:
   - URL del webhook: `https://tudominio.com/api/mercadopago/webhook`
   - Debe estar registrado en el panel de MercadoPago

---

## 📊 Monitoreo

### Estado de los contenedores

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Uso de recursos

```bash
docker stats
```

### Espacio en disco

```bash
df -h
du -sh /var/lib/docker
```

### Limpiar Docker

```bash
# Limpiar imágenes sin usar
docker image prune -a

# Limpiar volúmenes sin usar
docker volume prune

# Limpiar todo (⚠️ cuidado)
docker system prune -a
```

---

## 📞 Soporte

Si tienes problemas, revisa:

1. **Logs**: `docker-compose -f docker-compose.prod.yml logs -f`
2. **Estado de servicios**: `docker-compose -f docker-compose.prod.yml ps`
3. **Variables de entorno**: `cat server/.env`
4. **Puertos abiertos**: `netstat -tuln | grep -E '(80|443|3000)'`

---

## 🎯 Cambios importantes en esta versión

### ✅ Suscripciones corregidas
- Ahora las suscripciones duran **exactamente 30 días** (antes usaba meses variables)
- El contador de días funciona correctamente
- La renovación automática funciona bien

### ✅ SSL simplificado
- Script automático `init-ssl.sh` para configurar SSL fácilmente
- Renovación automática de certificados
- Configuración nginx optimizada

### ✅ Docker optimizado
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
