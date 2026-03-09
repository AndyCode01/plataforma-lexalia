#!/bin/bash

# ========================================
# Script de verificación de suscripciones
# Verifica y muestra el estado de las suscripciones
# ========================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verificación de suscripciones Lexalia${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar que los contenedores estén corriendo
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "api.*Up"; then
    echo -e "${RED}Error: El contenedor API no está corriendo${NC}"
    echo -e "${YELLOW}Inicia los servicios con: docker-compose -f docker-compose.prod.yml up -d${NC}"
    exit 1
fi

# Función para ejecutar query SQL
run_query() {
    docker-compose -f docker-compose.prod.yml exec -T db mysql -ulexalia -p"${DB_PASS}" lexalia -e "$1" 2>/dev/null
}

# Leer contraseña de la base de datos
if [ -f "server/.env" ]; then
    DB_PASS=$(grep "^DB_PASS=" server/.env | cut -d '=' -f2)
else
    echo -e "${RED}Error: server/.env no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}📊 Estadísticas de suscripciones:${NC}"
echo ""

# Contar suscripciones activas
ACTIVAS=$(run_query "SELECT COUNT(*) as count FROM Usuarios WHERE activo = 1 AND estado_pago = 'aprobado' AND fecha_expiracion > NOW();" | tail -n 1)
echo -e "   ${GREEN}Activas:${NC} $ACTIVAS"

# Contar suscripciones expiradas
EXPIRADAS=$(run_query "SELECT COUNT(*) as count FROM Usuarios WHERE activo = 0 AND estado_pago = 'expirado';" | tail -n 1)
echo -e "   ${RED}Expiradas:${NC} $EXPIRADAS"

# Contar próximas a expirar (7 días)
PROXIMAS=$(run_query "SELECT COUNT(*) as count FROM Usuarios WHERE activo = 1 AND estado_pago = 'aprobado' AND fecha_expiracion BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY);" | tail -n 1)
echo -e "   ${YELLOW}Por vencer (7 días):${NC} $PROXIMAS"

echo ""
echo -e "${GREEN}👥 Detalles de usuarios:${NC}"
echo ""

# Mostrar usuarios con suscripción activa
echo -e "${GREEN}Usuarios activos:${NC}"
run_query "SELECT id, nombre, email, plan, DATE_FORMAT(fecha_expiracion, '%Y-%m-%d') as expira FROM Usuarios WHERE activo = 1 AND estado_pago = 'aprobado' ORDER BY fecha_expiracion;" | column -t -s $'\t'

echo ""
echo -e "${YELLOW}Usuarios próximos a expirar (7 días):${NC}"
run_query "SELECT id, nombre, email, plan, DATE_FORMAT(fecha_expiracion, '%Y-%m-%d') as expira, DATEDIFF(fecha_expiracion, NOW()) as dias_restantes FROM Usuarios WHERE activo = 1 AND estado_pago = 'aprobado' AND fecha_expiracion BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) ORDER BY fecha_expiracion;" | column -t -s $'\t'

echo ""
echo -e "${RED}Usuarios con suscripción expirada:${NC}"
run_query "SELECT id, nombre, email, DATE_FORMAT(fecha_expiracion, '%Y-%m-%d') as expiró FROM Usuarios WHERE activo = 0 AND estado_pago = 'expirado' ORDER BY fecha_expiracion DESC LIMIT 10;" | column -t -s $'\t'

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Verificación completada${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Nota: El sistema verifica automáticamente cada hora${NC}"
echo -e "${YELLOW}Para forzar una verificación manual, ejecuta:${NC}"
echo -e "docker-compose -f docker-compose.prod.yml exec api node -e \"require('./tasks/subscriptionChecker.js').verificarSuscripcionesExpiradas()\""
echo ""
