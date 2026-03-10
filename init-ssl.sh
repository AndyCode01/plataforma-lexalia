#!/usr/bin/env bash

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"
PROD_CONF="docker/nginx/conf.d/production.conf"
PROD_CONF_BAK="docker/nginx/conf.d/production.conf.bak"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Inicializacion SSL (Let's Encrypt)${NC}"
echo -e "${GREEN}========================================${NC}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo -e "${RED}No existe $COMPOSE_FILE${NC}"
  exit 1
fi

if [[ ! -f "$PROD_CONF" ]]; then
  echo -e "${RED}No existe $PROD_CONF${NC}"
  exit 1
fi

if [[ -f "server/.env" ]]; then
  DOMAIN="$(grep '^DOMAIN=' server/.env | cut -d'=' -f2 || true)"
elif [[ -f "server/.env.production" ]]; then
  DOMAIN="$(grep '^DOMAIN=' server/.env.production | cut -d'=' -f2 || true)"
else
  DOMAIN=""
fi

if [[ -z "${DOMAIN}" || "${DOMAIN}" == "localhost" ]]; then
  echo -e "${RED}DOMAIN no valido. Configura server/.env con el dominio real.${NC}"
  exit 1
fi

read -r -p "Email para Let's Encrypt: " EMAIL
if [[ -z "${EMAIL}" ]]; then
  echo -e "${RED}El email es obligatorio.${NC}"
  exit 1
fi

echo -e "${YELLOW}Dominio:${NC} ${DOMAIN}"
echo -e "${YELLOW}Email:${NC} ${EMAIL}"

mkdir -p docker/nginx/ssl docker/nginx/www/.well-known/acme-challenge

cp "$PROD_CONF" "$PROD_CONF_BAK"

cat > "$PROD_CONF" <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 "acme ok";
        add_header Content-Type text/plain;
    }
}
EOF

echo "acme-ok" > docker/nginx/www/.well-known/acme-challenge/ping.txt

echo -e "${GREEN}Levantando nginx temporal en HTTP...${NC}"
docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true
docker-compose -f "$COMPOSE_FILE" up -d db api nginx
sleep 3

echo -e "${GREEN}Verificando challenge HTTP...${NC}"
curl -4fsS "http://${DOMAIN}/.well-known/acme-challenge/ping.txt" >/dev/null
curl -4fsS "http://www.${DOMAIN}/.well-known/acme-challenge/ping.txt" >/dev/null
echo -e "${GREEN}Challenge HTTP accesible para ambos dominios.${NC}"

echo -e "${GREEN}Solicitando certificado...${NC}"
docker-compose -f "$COMPOSE_FILE" run --rm --entrypoint certbot certbot \
  certonly --webroot -w /var/www/certbot \
  --email "${EMAIL}" \
  -d "${DOMAIN}" -d "www.${DOMAIN}" \
  --agree-tos --non-interactive

if [[ ! -f "docker/nginx/ssl/live/${DOMAIN}/fullchain.pem" ]]; then
  echo -e "${RED}No se encontro el certificado en docker/nginx/ssl/live/${DOMAIN}${NC}"
  mv "$PROD_CONF_BAK" "$PROD_CONF"
  exit 1
fi

mv "$PROD_CONF_BAK" "$PROD_CONF"

echo -e "${GREEN}Levantando stack final con HTTPS...${NC}"
docker-compose -f "$COMPOSE_FILE" down
docker-compose -f "$COMPOSE_FILE" up -d db api nginx

echo -e "${GREEN}SSL listo.${NC}"
echo -e "${GREEN}Prueba:${NC} curl -vk https://${DOMAIN}/api/health"
