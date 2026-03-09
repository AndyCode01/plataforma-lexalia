#!/bin/bash

# ========================================
# Pre-Deploy Checklist Script
# Verifica que todo esté listo antes de deploy
# ========================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Pre-Deploy Checklist - Lexalia${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

check_pass() {
    echo -e "   ${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "   ${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "   ${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# 1. Verificar archivos necesarios
echo -e "${BLUE}📁 Verificando archivos...${NC}"

if [ -f "docker-compose.prod.yml" ]; then
    check_pass "docker-compose.prod.yml existe"
else
    check_fail "docker-compose.prod.yml NO encontrado"
fi

if [ -f "server/.env" ]; then
    check_pass "server/.env existe"
else
    if [ -f "server/.env.production" ]; then
        check_warn "server/.env NO existe, pero server/.env.production sí"
        echo "        Copia con: cp server/.env.production server/.env"
    else
        check_fail "server/.env y server/.env.production NO encontrados"
    fi
fi

if [ -f "init-ssl.sh" ]; then
    check_pass "init-ssl.sh existe"
else
    check_warn "init-ssl.sh NO encontrado"
fi

echo ""

# 2. Verificar variables de entorno
echo -e "${BLUE}⚙️  Verificando configuración...${NC}"

if [ -f "server/.env" ]; then
    DOMAIN=$(grep "^DOMAIN=" server/.env | cut -d '=' -f2 || echo "")
    DB_PASS=$(grep "^DB_PASS=" server/.env | cut -d '=' -f2 || echo "")
    JWT_SECRET=$(grep "^JWT_SECRET=" server/.env | cut -d '=' -f2 || echo "")
    MP_TOKEN=$(grep "^MERCADOPAGO_TOKEN=" server/.env | cut -d '=' -f2 || echo "")
    NODE_ENV=$(grep "^NODE_ENV=" server/.env | cut -d '=' -f2 || echo "")
    FRONTEND_URL=$(grep "^FRONTEND_URL=" server/.env | cut -d '=' -f2 || echo "")

    # Verificar DOMAIN
    if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "localhost" ] || [ "$DOMAIN" = "andreitus.online" ]; then
        check_fail "DOMAIN no está configurado correctamente (actual: $DOMAIN)"
    else
        check_pass "DOMAIN configurado: $DOMAIN"
    fi

    # Verificar NODE_ENV
    if [ "$NODE_ENV" = "production" ]; then
        check_pass "NODE_ENV configurado como production"
    else
        check_warn "NODE_ENV no es 'production' (actual: $NODE_ENV)"
    fi

    # Verificar DB_PASS
    if [ -z "$DB_PASS" ] || [ "$DB_PASS" = "Lexalia2026*\$" ]; then
        check_warn "DB_PASS usa valor por defecto - cambiar por seguridad"
    else
        if [ ${#DB_PASS} -lt 12 ]; then
            check_warn "DB_PASS es muy corta (${#DB_PASS} caracteres)"
        else
            check_pass "DB_PASS configurada (${#DB_PASS} caracteres)"
        fi
    fi

    # Verificar JWT_SECRET
    if [ -z "$JWT_SECRET" ] || [[ "$JWT_SECRET" == *"cambiar"* ]]; then
        check_fail "JWT_SECRET usa valor por defecto - DEBE cambiarse"
    else
        if [ ${#JWT_SECRET} -lt 32 ]; then
            check_warn "JWT_SECRET es muy corta (${#JWT_SECRET} caracteres)"
        else
            check_pass "JWT_SECRET configurada (${#JWT_SECRET} caracteres)"
        fi
    fi

    # Verificar MercadoPago Token
    if [ -z "$MP_TOKEN" ]; then
        check_fail "MERCADOPAGO_TOKEN no configurado"
    elif [[ "$MP_TOKEN" == *"REEMPLAZA"* ]] || [[ "$MP_TOKEN" == *"CAMBIAR"* ]]; then
        check_fail "MERCADOPAGO_TOKEN no configurado (valor por defecto)"
    elif [[ "$MP_TOKEN" == TEST-* ]]; then
        check_warn "MERCADOPAGO_TOKEN parece ser de TEST (no producción)"
    else
        check_pass "MERCADOPAGO_TOKEN configurado"
    fi

    # Verificar FRONTEND_URL
    if [[ "$FRONTEND_URL" == https://* ]]; then
        check_pass "FRONTEND_URL usa HTTPS"
    else
        check_warn "FRONTEND_URL no usa HTTPS (actual: $FRONTEND_URL)"
    fi
else
    check_fail "No se puede verificar configuración - server/.env no existe"
fi

echo ""

# 3. Verificar Docker
echo -e "${BLUE}🐳 Verificando Docker...${NC}"

if command -v docker &> /dev/null; then
    check_pass "Docker instalado ($(docker --version | cut -d ' ' -f3 | cut -d ',' -f1))"
else
    check_fail "Docker NO instalado"
fi

if command -v docker-compose &> /dev/null; then
    check_pass "Docker Compose instalado ($(docker-compose --version | cut -d ' ' -f4 | cut -d ',' -f1))"
else
    check_fail "Docker Compose NO instalado"
fi

echo ""

# 4. Verificar dependencias del proyecto
echo -e "${BLUE}📦 Verificando dependencias...${NC}"

if [ -d "node_modules" ]; then
    check_pass "node_modules existe"
else
    check_warn "node_modules NO existe - ejecuta 'npm install'"
fi

if [ -f "package.json" ]; then
    check_pass "package.json existe"
else
    check_fail "package.json NO encontrado"
fi

if [ -d "server/node_modules" ]; then
    check_pass "server/node_modules existe"
else
    check_warn "server/node_modules NO existe - ejecuta 'npm install' en /server"
fi

echo ""

# 5. Verificar build
echo -e "${BLUE}🏗️  Verificando build...${NC}"

if [ -d "dist" ]; then
    FILES_COUNT=$(find dist -type f | wc -l)
    if [ $FILES_COUNT -gt 0 ]; then
        check_pass "Build del frontend existe ($FILES_COUNT archivos)"
    else
        check_warn "Directorio dist existe pero está vacío"
    fi
else
    check_warn "Build del frontend (dist/) NO existe - ejecuta 'npm run build'"
fi

echo ""

# 6. Verificar puertos
echo -e "${BLUE}🔌 Verificando puertos...${NC}"

if command -v netstat &> /dev/null || command -v ss &> /dev/null; then
    for PORT in 80 443 3000; do
        if netstat -tuln 2>/dev/null | grep -q ":$PORT " || ss -tuln 2>/dev/null | grep -q ":$PORT "; then
            check_warn "Puerto $PORT está en uso - puede causar conflictos"
        else
            check_pass "Puerto $PORT disponible"
        fi
    done
else
    check_warn "No se puede verificar puertos (netstat/ss no disponible)"
fi

echo ""

# Resumen
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Resumen${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Todo listo para deploy!${NC}"
    echo ""
    echo -e "Siguiente paso:"
    echo -e "   ${GREEN}./init-ssl.sh${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS advertencia(s) encontrada(s)${NC}"
    echo -e "${YELLOW}Puedes continuar pero revisa las advertencias${NC}"
    echo ""
    echo -e "Para continuar:"
    echo -e "   ${YELLOW}./init-ssl.sh${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(es) encontrado(s)${NC}"
    echo -e "${RED}Debes corregir los errores antes de continuar${NC}"
    echo ""
    exit 1
fi
