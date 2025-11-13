#!/bin/bash
# Script de despliegue automático para VPS
# Ubicación en VPS: /root/plataforma-lexalia/deploy.sh

cd /root/plataforma-lexalia

# Verificar si hay cambios
git fetch origin main

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ $LOCAL = $REMOTE ]; then
    echo "$(date) - No hay cambios nuevos"
    exit 0
fi

echo "$(date) - � Cambios detectados, desplegando..."

# Descargar cambios
git pull origin main

# Backend
cd server
npm install --production

# Frontend
cd ..
npm install
npm run build

# Copiar a Nginx
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

# Reiniciar backend
pm2 restart lexalia-api

echo "$(date) - ✅ Despliegue completado"
