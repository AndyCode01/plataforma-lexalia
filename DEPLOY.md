# Despliegue en Producción (Docker)

## 1. Preparar credenciales locales
Asegúrate que `server/.env` tenga las credenciales correctas:
```bash
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASS=<tu_contraseña_mysql>
DB_NAME=lexalia
JWT_SECRET=<tu_jwt_secret_largo_y_seguro>
```

## 2. Subir código al VPS
```bash
# Desde tu máquina local
scp -r . root@72.61.6.46:/var/www/plataforma-lexalia/

# O si usas git
git push origin main
# Luego en VPS: cd /var/www/plataforma-lexalia && git pull
```

## 3. En el VPS: Levantar Docker
```bash
ssh root@72.61.6.46

cd /var/www/plataforma-lexalia

# Construir imágenes
docker compose build

# Levantar servicios
docker compose up -d db api nginx

# Verificar
docker compose ps
```

## 4. Generar certificado SSL (Let's Encrypt)
```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d lexaliaabogados.com \
  -d www.lexaliaabogados.com \
  --email lexaliaadm@gmail.com \
  --agree-tos \
  --non-interactive
```

## 5. Recargar Nginx con SSL
```bash
docker compose exec nginx nginx -s reload
```

## 6. Restaurar Base de Datos
```bash
docker compose exec -T db mysql -u root -p lexalia < /var/www/plataforma-lexalia/lexalia_backup_clean.sql
# (Te pedirá contraseña, es la misma de DB_PASS)
```

## 7. Verificar que funciona
```bash
# HTTP redirige a HTTPS
curl -I http://lexaliaabogados.com

# HTTPS funciona
curl -I https://lexaliaabogados.com

# API responde
curl https://lexaliaabogados.com/api/health
```

## Renovación automática de certificados
Ya está configurado en `docker-compose.yml`. Certbot se renueva cada 12h automáticamente.

## Logs en producción
```bash
docker compose logs -f api
docker compose logs -f nginx
docker compose logs -f db
```

## Detener todo
```bash
docker compose down
```
