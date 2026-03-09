# 🚀 Quick Deploy Guide - Lexalia

**Tiempo estimado**: 15-20 minutos

## 📋 Pre-requisitos

- [ ] VPS con Ubuntu/Debian
- [ ] Dominio apuntando a la IP del VPS
- [ ] Token de MercadoPago de producción
- [ ] Acceso SSH al VPS

---

## 🎯 Pasos Rápidos

### 1. Conectar al VPS

```bash
ssh root@TU_IP_VPS
```

### 2. Setup inicial (copiar y pegar todo junto)

```bash
# Actualizar sistema e instalar Docker
apt update && apt upgrade -y
apt install -y curl wget git nano ufw
curl -fsSL https://get.docker.com | sh
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Configurar firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 3. Clonar proyecto

```bash
cd /home
git clone https://github.com/TU_USUARIO/plataforma-lexalia.git
cd plataforma-lexalia
```

### 4. Configurar variables

```bash
# Copiar archivo de producción
cp server/.env.production server/.env

# Editar configuración
nano server/.env
```

**Edita estos valores en `server/.env`:**

```bash
# 1. Cambia al dominio de tu VPS
DOMAIN=tudominio.com
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://tudominio.com

# 2. Token de MercadoPago de PRODUCCIÓN
MERCADOPAGO_TOKEN=TU_TOKEN_AQUI

# 3. Tu email
EMAIL=tu@email.com

# 4. Puedes dejar estos valores o cambiarlos por seguridad:
DB_PASS=Lexalia2026*$
JWT_SECRET=mi-secreto-super-seguro-cambiar-en-produccion-123456
```

**Guardar archivo:** `Ctrl+X`, luego `Y`, luego `Enter`

### 5. Build del frontend

```bash
npm install
npm run build
```

### 6. Configurar SSL (CRÍTICO)

**⚠️ IMPORTANTE: Lee primero [SSL-SETUP.md](./SSL-SETUP.md) para verificar:**
- ✅ Dominio apunta al VPS (`nslookup tudominio.com`)
- ✅ Firewall con puertos 80 y 443 abiertos
- ✅ Puerto 80 libre (sin Apache/nginx instalado)

**Si todo está OK, ejecuta:**

```bash
chmod +x init-ssl.sh
./init-ssl.sh
```

**Si tienes problemas con SSL, consulta la guía completa:** [SSL-SETUP.md](./SSL-SETUP.md)

### 7. Listo! 🎉

Abre en tu navegador: **https://tudominio.com**

---

## 🔍 Verificación

```bash
# Ver estado de servicios
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar API
curl https://tudominio.com/api/health
```

---

## 🛠️ Comandos útiles

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f api

# Reiniciar API
docker-compose -f docker-compose.prod.yml restart api

# Verificar suscripciones
chmod +x check-subscriptions.sh
./check-subscriptions.sh

# Backup de BD
docker exec lexalia_db mysqldump -u lexalia -p lexalia > backup.sql
```

---

## ❌ Troubleshooting

### ❌ SSL falla

```bash
# Verifica que el dominio apunte correctamente
nslookup tudominio.com

# Debe mostrar la IP de tu VPS
```

### ❌ API no responde (502)

```bash
# Ver logs del API
docker-compose -f docker-compose.prod.yml logs api

# Reiniciar API
docker-compose -f docker-compose.prod.yml restart api
```

### ❌ Base de datos no inicia

```bash
# Ver logs de MySQL
docker-compose -f docker-compose.prod.yml logs db

# Verificar contraseña en .env
grep DB_PASS server/.env
```

---

## 📚 Documentación completa

Para más detalles, ver: **[DEPLOY.md](./DEPLOY.md)**

---

## 🔄 Actualizar código

```bash
cd /home/plataforma-lexalia
git pull origin main

# Si cambió el backend
docker-compose -f docker-compose.prod.yml build api --no-cache
docker-compose -f docker-compose.prod.yml restart api

# Si cambió el frontend
npm run build
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## ✅ Checklist Final

- [ ] Sitio carga en HTTPS sin errores
- [ ] API responde en `/api/health`
- [ ] Puedes registrar un abogado
- [ ] MercadoPago funciona (probar con $100)
- [ ] Los logs no muestran errores críticos
- [ ] Certificado SSL válido (candado verde)

---

**¿Problemas?** Revisa los logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```
