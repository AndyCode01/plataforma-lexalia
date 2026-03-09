#!/bin/bash

# ========================================
# Script de inicialización SSL con Let's Encrypt
# Para usar en VPS con Docker
# ========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Inicialización SSL para Lexalia${NC}"
echo -e "${GREEN}========================================${NC}"

# Verificar que estemos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}Error: docker-compose.prod.yml no encontrado${NC}"
    echo -e "${RED}Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Leer el dominio del archivo .env
if [ -f "server/.env" ]; then
    DOMAIN=$(grep "^DOMAIN=" server/.env | cut -d '=' -f2)
    EMAIL=$(grep "^EMAIL=" server/.env | cut -d '=' -f2 || echo "")
else
    echo -e "${RED}Error: server/.env no encontrado${NC}"
    exit 1
fi

# Validar que el dominio esté configurado
if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "localhost" ] || [ "$DOMAIN" = "andreitus.online" ]; then
    echo -e "${RED}Error: Debes configurar el DOMAIN en server/.env${NC}"
    echo -e "${YELLOW}Abre server/.env y cambia DOMAIN a tu dominio real${NC}"
    exit 1
fi

# Solicitar email si no está configurado
if [ -z "$EMAIL" ]; then
    echo -e "${YELLOW}Ingresa tu email para certificados SSL:${NC}"
    read -p "Email: " EMAIL
fi

echo ""
echo -e "${GREEN}📋 Configuración:${NC}"
echo -e "   Dominio: ${GREEN}${DOMAIN}${NC}"
echo -e "   Email: ${GREEN}${EMAIL}${NC}"
echo ""

# Confirmar
read -p "¿Continuar con esta configuración? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cancelado${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 Paso 1: Crear directorios necesarios${NC}"
mkdir -p docker/nginx/ssl
mkdir -p docker/nginx/www
echo -e "${GREEN}   ✓ Directorios creados${NC}"

echo ""
echo -e "${GREEN}🚀 Paso 2: Iniciar nginx temporal para validación HTTP${NC}"
# Crear configuración temporal de nginx solo para HTTP (sin SSL)
cat > docker/nginx/conf.d/temp-http.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 'Validación SSL en progreso...';
        add_header Content-Type text/plain;
    }
}
EOF

# Iniciar solo nginx y certbot temporalmente
docker-compose -f docker-compose.prod.yml up -d nginx
sleep 5
echo -e "${GREEN}   ✓ Nginx iniciado${NC}"

echo ""
echo -e "${GREEN}🚀 Paso 3: Obtener certificado SSL${NC}"
echo -e "${YELLOW}   Esto puede tardar 1-2 minutos...${NC}"

# Obtener certificado
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  --email "${EMAIL}" \
  -d "${DOMAIN}" \
  -d "www.${DOMAIN}" \
  --agree-tos \
  --non-interactive \
  --force-renewal

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✓ Certificado SSL obtenido exitosamente${NC}"
else
    echo -e "${RED}   ✗ Error obteniendo certificado SSL${NC}"
    echo -e "${YELLOW}   Verifica que:${NC}"
    echo -e "${YELLOW}   1. El dominio ${DOMAIN} apunte a este servidor${NC}"
    echo -e "${YELLOW}   2. Los puertos 80 y 443 estén abiertos${NC}"
    echo -e "${YELLOW}   3. No haya otro servicio usando el puerto 80${NC}"
    docker-compose -f docker-compose.prod.yml down
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Paso 4: Restaurar configuración nginx de producción${NC}"
# Eliminar configuración temporal
rm docker/nginx/conf.d/temp-http.conf

# Reiniciar todos los servicios con la configuración completa
docker-compose -f docker-compose.prod.yml down
sleep 2
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SSL configurado exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Tu sitio está ahora disponible en:${NC}"
echo -e "   ${GREEN}https://${DOMAIN}${NC}"
echo -e "   ${GREEN}https://www.${DOMAIN}${NC}"
echo ""
echo -e "${YELLOW}Nota: El certificado se renovará automáticamente cada 60 días${NC}"
echo ""
