#!/bin/bash
# Script de despliegue automático para VPS
# Ubicación en VPS: /root/plataforma-lexalia/deploy.sh

set -e  # Detener si hay errores

echo "🚀 Iniciando despliegue..."

# Ir al directorio del proyecto
cd /root/plataforma-lexalia

# Descargar últimos cambios
echo "📥 Descargando cambios de GitHub..."
git pull origin main

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd server
npm install --production

# Volver a raíz y construir frontend
echo "🏗️  Construyendo frontend..."
cd ..
npm install
npm run build

# Copiar build a Nginx
echo "📋 Copiando archivos al servidor web..."
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

# Reiniciar backend con PM2
echo "🔄 Reiniciando backend..."
pm2 restart lexalia-api

# Mostrar logs
echo "✅ Despliegue completado!"
echo "📊 Logs del backend:"
pm2 logs lexalia-api --lines 10 --nostream
