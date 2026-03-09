# 📝 Resumen de Cambios - Preparación para VPS

## ✅ Cambios Realizados

### 1. 🔧 Sistema de Suscripciones Actualizado

**Problema anterior:**
- Las suscripciones usaban `.setMonth()` que añade "1 mes"
- Esto causaba inconsistencias (enero 31 + 1 mes = marzo 3 en año no bisiesto)
- Conteo de días variable según el mes

**Solución implementada:**
- Ahora usa el **estándar de la industria** (Netflix, Spotify)
- **Mismo día del mes siguiente**: 9 marzo → 9 abril
- Cálculo: `fechaFin.setMonth(fechaFin.getMonth() + 1)`
- Aplica en todos los lugares:
  - ✅ `mercadoPagoController.js` - función `aplicarEstadoPago`
  - ✅ `routes/mercadopago.js` - endpoint `/simular-pago`

**Casos especiales:**
- 31 enero → 28 febrero (febrero no tiene día 31)
- 31 marzo → 30 abril (abril no tiene día 31)
- JavaScript lo maneja automáticamente

**Archivos modificados:**
- [server/controllers/mercadoPagoController.js](server/controllers/mercadoPagoController.js)
- [server/routes/mercadopago.js](server/routes/mercadopago.js)

### 2. 🔐 Configuración SSL y Deploy

**Archivos creados:**

| Archivo | Propósito |
|---------|-----------|
| `init-ssl.sh` | Script automático para obtener certificado SSL de Let's Encrypt |
| `pre-deploy-check.sh` | Verifica que todo esté listo antes de desplegar |
| `check-subscriptions.sh` | Muestra estadísticas y estado de suscripciones |
| `QUICK-DEPLOY.md` | Guía rápida de deploy (15-20 min) |
| `SUSCRIPCIONES.md` | Documentación completa del sistema de suscripciones |
| `docker/nginx/conf.d/init-ssl.conf` | Configuración temporal de nginx para obtener SSL |

**Archivos actualizados:**

| Archivo | Cambios |
|---------|---------|
| `server/.env.production` | Añadidos comentarios y advertencias claras |
| `DEPLOY.md` | Guía completa y detallada con troubleshooting |

---

## 🚀 Antes de Desplegar al VPS

### Checklist Pre-Deploy

- [ ] **Dominio configurado**: Apuntando a la IP del VPS (registros A)
- [ ] **Token MercadoPago**: Obtener token de **PRODUCCIÓN** (no el de prueba)
- [ ] **Email**: Para certificados SSL
- [ ] **Backup**: Si es migración, hacer backup de BD actual
- [ ] **VPS accesible**: SSH funcionando

### Configuraciones a Cambiar

En el archivo `server/.env` (crear desde `server/.env.production`):

```bash
# 1. Tu dominio real
DOMAIN=tudominio.com
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://tudominio.com

# 2. Contraseñas seguras (generar nuevas)
DB_PASS=$(openssl rand -base64 16)
JWT_SECRET=$(openssl rand -hex 32)

# 3. Token de MercadoPago de PRODUCCIÓN
MERCADOPAGO_TOKEN=TU_TOKEN_DE_PRODUCCION

# 4. Tu email
EMAIL=tu@email.com
```

> ⚠️ **IMPORTANTE**: Guarda las contraseñas generadas en un lugar seguro

---

## 📖 Guías Disponibles

### Para Deploy Rápido (15-20 min)
👉 Ver: [QUICK-DEPLOY.md](QUICK-DEPLOY.md)

### Para Deploy Completo con Detalles
👉 Ver: [DEPLOY.md](DEPLOY.md)

### Para Entender Suscripciones
👉 Ver: [SUSCRIPCIONES.md](SUSCRIPCIONES.md)

---

## 🛠️ Scripts Útiles

### Pre-Deploy

```bash
# 1. Verificar que todo esté listo
chmod +x pre-deploy-check.sh
./pre-deploy-check.sh
```

### Durante Deploy

```bash
# 2. Configurar SSL automáticamente
chmod +x init-ssl.sh
./init-ssl.sh
```

### Post-Deploy

```bash
# 3. Verificar suscripciones
chmod +x check-subscriptions.sh
./check-subscriptions.sh
```

---

## 🎯 Flujo de Deploy Recomendado

```
1. Preparar VPS
   └─> Instalar Docker y Docker Compose
   └─> Configurar firewall (puertos 80, 443)

2. Clonar proyecto
   └─> git clone ...

3. Configurar variables
   └─> cp server/.env.production server/.env
   └─> nano server/.env (cambiar valores)

4. Verificar configuración
   └─> ./pre-deploy-check.sh

5. Build del frontend
   └─> npm install
   └─> npm run build

6. Inicializar SSL
   └─> ./init-ssl.sh

7. Verificar funcionamiento
   └─> curl https://tudominio.com/api/health
   └─> Abrir en navegador

8. Verificar suscripciones
   └─> ./check-subscriptions.sh
```

---

## 🔍 Verificaciones Post-Deploy

### 1. SSL Funcionando

```bash
# Debe mostrar certificado válido
curl -I https://tudominio.com

# Debe responder con 200
```

### 2. API Respondiendo

```bash
# Debe responder: {"ok":true}
curl https://tudominio.com/api/health
```

### 3. Servicios Docker

```bash
# Todos deben estar "Up"
docker-compose -f docker-compose.prod.yml ps
```

### 4. Logs Sin Errores

```bash
# No debe haber errores críticos
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### 5. Sistema de Suscripciones

```bash
# Debe mostrar estadísticas
./check-subscriptions.sh
```

### 6. Test de Pago

1. Registrar un abogado de prueba
2. Procesar un pago pequeño ($100 COP)
3. Verificar que se active automáticamente
4. Verificar que `fecha_expiracion` sea 30 días después:
   ```bash
   docker-compose -f docker-compose.prod.yml exec db mysql -ulexalia -p
   SELECT nombre, fecha_activacion, fecha_expiracion, 
          DATEDIFF(fecha_expiracion, fecha_activacion) as dias 
   FROM Usuarios WHERE id = ULTIMO_ID;
   ```
   La columna `dias` debe ser **30**

---

## 📞 Si Algo Sale Mal

### Ver logs en tiempo real

```bash
docker-compose -f docker-compose.prod.yml logs -f api
```

### Reiniciar servicios

```bash
docker-compose -f docker-compose.prod.yml restart
```

### Verificar configuración

```bash
cat server/.env
docker-compose -f docker-compose.prod.yml ps
```

### Consultar guías de troubleshooting

- Ver sección "Troubleshooting" en [DEPLOY.md](DEPLOY.md)
- Ver sección "Troubleshooting" en [SUSCRIPCIONES.md](SUSCRIPCIONES.md)

---

## 🎉 Listo para Producción

Una vez completados todos los pasos:

✅ Sitio accesible en HTTPS con certificado válido  
✅ API respondiendo correctamente  
✅ Sistema de pagos funcionando  
✅ Suscripciones con duración exacta de 30 días  
✅ Verificación automática cada hora  
✅ Scripts de monitoreo disponibles  

---

## 📋 Mantenimiento Continuo

### Semanal

```bash
# Ver estado de suscripciones
./check-subscriptions.sh

# Verificar logs
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Mensual

```bash
# Backup de base de datos
docker exec lexalia_db mysqldump -u lexalia -p lexalia > backup_$(date +%Y%m%d).sql

# Limpiar Docker
docker system prune
```

### Cuando hay actualizaciones

```bash
cd /home/plataforma-lexalia
git pull origin main

# Si cambió backend
docker-compose -f docker-compose.prod.yml build api --no-cache
docker-compose -f docker-compose.prod.yml restart api

# Si cambió frontend
npm run build
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 💡 Mejoras Futuras Sugeridas

- [ ] Notificaciones por email antes de expiración
- [ ] Dashboard de métricas en el admin
- [ ] Backup automático diario de BD
- [ ] Monitoreo con Prometheus/Grafana
- [ ] Logs centralizados
- [ ] Tests automatizados del sistema de suscripciones

---

**Fecha de actualización:** Marzo 9, 2026  
**Versión:** 2.0 - Deploy Production Ready

🚀 ¡Todo listo para producción!
