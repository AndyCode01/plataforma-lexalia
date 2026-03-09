# 🔐 Configuración SSL - Guía Paso a Paso

## ⚠️ ANTES DE EMPEZAR - Checklist Crítico

### 1. Verificar que el dominio apunte al VPS

```bash
# Desde tu PC o desde cualquier lugar
nslookup tudominio.com
# O
ping tudominio.com
```

**Debe mostrar:**
```
Name:    tudominio.com
Address: LA_IP_DE_TU_VPS
```

**Si NO muestra tu IP del VPS:**
- Ve a tu proveedor de dominio (GoDaddy, Namecheap, Hostinger, etc.)
- Configura los registros DNS:
  - Tipo: `A` | Nombre: `@` | Valor: `IP_DE_TU_VPS`
  - Tipo: `A` | Nombre: `www` | Valor: `IP_DE_TU_VPS`
- **Espera 10-60 minutos** para que propague (a veces hasta 24h)

---

### 2. Abrir puertos del firewall en el VPS

```bash
# Conectar al VPS
ssh root@IP_DE_TU_VPS

# Instalar firewall si no está
apt install -y ufw

# Abrir puertos necesarios
ufw allow 22/tcp      # SSH (¡IMPORTANTE! No te bloquees)
ufw allow 80/tcp      # HTTP (necesario para Let's Encrypt)
ufw allow 443/tcp     # HTTPS
ufw allow 3000/tcp    # API (opcional, nginx hace proxy)

# Activar firewall
ufw --force enable

# Verificar que estén abiertos
ufw status
```

**Debe mostrar:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

### 3. Verificar que nginx pueda escuchar en puerto 80

```bash
# Ver si algo está usando el puerto 80
netstat -tuln | grep :80
# O
ss -tuln | grep :80

# Si hay algo, detenerlo
# Ejemplo: Apache
systemctl stop apache2
systemctl disable apache2

# Ejemplo: nginx instalado directamente
systemctl stop nginx
```

**El puerto 80 debe estar LIBRE** antes de continuar.

---

## 🚀 Obtener Certificado SSL

### Método 1: Automático (Recomendado)

```bash
# En el VPS, dentro del proyecto
cd /home/plataforma-lexalia

# Asegúrate que el dominio esté en server/.env
nano server/.env
# Verifica: DOMAIN=tudominio.com

# Dar permisos al script
chmod +x init-ssl.sh

# Ejecutar
./init-ssl.sh
```

El script automáticamente:
1. ✅ Inicia nginx temporal en puerto 80
2. ✅ Ejecuta certbot para obtener certificado
3. ✅ Reinicia todos los servicios con HTTPS

---

### Método 2: Manual (si el automático falla)

**Paso 1: Crear directorios**

```bash
mkdir -p docker/nginx/ssl
mkdir -p docker/nginx/www
```

**Paso 2: Iniciar solo nginx temporalmente**

```bash
# Iniciar solo nginx (sin API ni BD por ahora)
docker-compose -f docker-compose.prod.yml up -d nginx
```

**Paso 3: Obtener certificado**

```bash
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  --email tu@email.com \
  -d tudominio.com \
  -d www.tudominio.com \
  --agree-tos \
  --non-interactive
```

**Si es exitoso, verás:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/tudominio.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/tudominio.com/privkey.pem
```

**Paso 4: Reiniciar todos los servicios**

```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## ✅ Verificar que SSL funciona

### 1. Verificar certificado

```bash
# Debe responder con código 200 y mostrar headers HTTPS
curl -I https://tudominio.com
```

**Salida esperada:**
```
HTTP/2 200
server: nginx/1.27.3
date: Sun, 09 Mar 2026 ...
strict-transport-security: max-age=31536000; includeSubDomains
```

### 2. Verificar API

```bash
curl https://tudominio.com/api/health
```

**Debe responder:**
```json
{"ok":true}
```

### 3. Abrir en navegador

Abre: **https://tudominio.com**

**Debe mostrar:**
- ✅ Candado verde en la barra de dirección
- ✅ "Conexión segura" o "Secure"
- ✅ Tu sitio carga correctamente

---

## ❌ Problemas Comunes

### Error: "Connection refused" en puerto 80

**Causa:** Firewall bloqueando puerto 80

**Solución:**
```bash
# Verificar firewall
ufw status

# Si puerto 80 no está abierto
ufw allow 80/tcp
```

---

### Error: "Challenge failed for domain"

**Causa:** El dominio NO apunta al VPS

**Solución:**
```bash
# Verificar DNS
nslookup tudominio.com

# Si no muestra tu IP, configurar DNS y esperar
```

**Mientras esperas el DNS:**
- Puede tardar 10 minutos a 24 horas
- Verifica cada 30 minutos con `nslookup`
- Algunos proveedores son más lentos que otros

---

### Error: "Port 80 already in use"

**Causa:** Otro servicio usando puerto 80 (Apache, nginx, etc.)

**Solución:**
```bash
# Ver qué está usando el puerto
netstat -tuln | grep :80

# Detener Apache si existe
systemctl stop apache2
systemctl disable apache2

# Detener nginx si está instalado directamente
systemctl stop nginx
systemctl disable nginx

# Verificar que ya no hay nada
netstat -tuln | grep :80
# Debe estar vacío
```

---

### Error: "Too many failed authorization attempts"

**Causa:** Intentaste obtener certificado muchas veces seguidas

**Solución:**
- Let's Encrypt tiene límite de 5 intentos por hora
- **Espera 1 hora** antes de intentar de nuevo
- Mientras tanto, verifica:
  - Que el dominio apunte correctamente (`nslookup`)
  - Que puerto 80 esté abierto (`ufw status`)
  - Que no haya otro servicio en puerto 80

---

## 🔄 Renovación Automática

El certificado SSL expira cada 90 días, pero el contenedor `certbot` lo renueva automáticamente:

```yaml
# En docker-compose.prod.yml
certbot:
  image: certbot/certbot:latest
  entrypoint: /bin/sh -c "while :; do certbot renew --quiet; sleep 86400; done"
```

**Se ejecuta automáticamente cada 24 horas.**

Para renovar manualmente:
```bash
docker-compose -f docker-compose.prod.yml exec certbot certbot renew
```

---

## 📋 Checklist Final SSL

Antes de continuar con el resto del deploy:

- [ ] `nslookup tudominio.com` muestra la IP del VPS
- [ ] `ufw status` muestra puertos 80 y 443 abiertos
- [ ] `netstat -tuln | grep :80` no muestra nada (puerto libre)
- [ ] Certificado obtenido exitosamente
- [ ] `curl https://tudominio.com/api/health` responde `{"ok":true}`
- [ ] Navegador muestra candado verde en `https://tudominio.com`

**Si todos los puntos están ✅, continúa con el deploy normal.**

---

## 🆘 Última Opción: Deploy sin SSL temporalmente

Si no puedes obtener el certificado pero quieres probar que todo funciona:

```bash
# Modificar docker-compose.prod.yml temporalmente
# Comentar la sección SSL de nginx

# Iniciar sin SSL
docker-compose -f docker-compose.prod.yml up -d

# Acceder por HTTP (sin S)
curl http://tudominio.com/api/health
```

**⚠️ SOLO PARA PRUEBAS - No dejes así en producción**

Una vez que el DNS propague correctamente, obtienes el certificado y activas HTTPS.
