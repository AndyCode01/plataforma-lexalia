# 📅 Sistema de Suscripciones - Lexalia

## 🔄 Funcionamiento

### Duración de Suscripciones

Las suscripciones en Lexalia siguen el **estándar de la industria** (Netflix, Spotify, etc.):
- **Mismo día del mes siguiente**

```javascript
// Cálculo de fecha de expiración (estándar Netflix)
const fechaInicio = new Date();
const fechaFin = new Date(fechaInicio);
fechaFin.setMonth(fechaFin.getMonth() + 1); // +1 mes calendario
```

**Ejemplos:**
- 9 marzo → expira 9 abril
- 15 febrero → expira 15 marzo
- 31 enero → expira 28 febrero (caso especial: febrero no tiene día 31)

### Estados de Suscripción

| Estado | Descripción | Usuario Activo |
|--------|-------------|----------------|
| `aprobado` | Pago aprobado, suscripción vigente | ✅ Sí |
| `pendiente` | Pago en proceso de verificación | ❌ No |
| `rechazado` | Pago rechazado por MercadoPago | ❌ No |
| `expirado` | Suscripción venció (30 días cumplidos) | ❌ No |

### Verificación Automática

El sistema verifica **cada hora** las suscripciones expiradas:

- ⏰ **Frecuencia**: Cada 60 minutos
- 🔍 **Acción**: Busca usuarios con `fecha_expiracion < fecha_actual`
- ⚙️ **Resultado**: Marca como `activo = false` y `estado_pago = 'expirado'`

```javascript
// En server.js
setInterval(verificarSuscripcionesExpiradas, 60 * 60 * 1000); // Cada hora
```

---

## 📊 Verificar Suscripciones

### Método 1: Script automático

```bash
chmod +x check-subscriptions.sh
./check-subscriptions.sh
```

**Salida esperada:**

```
========================================
Verificación de suscripciones Lexalia
========================================

📊 Estadísticas de suscripciones:

   Activas: 5
   Expiradas: 2
   Por vencer (7 días): 1

👥 Detalles de usuarios:
...
```

### Método 2: Manual (SQL directo)

```bash
# Conectar a la base de datos
docker-compose -f docker-compose.prod.yml exec db mysql -ulexalia -p

# Ver suscripciones activas
SELECT id, nombre, email, plan, fecha_activacion, fecha_expiracion, 
       DATEDIFF(fecha_expiracion, NOW()) as dias_restantes
FROM Usuarios 
WHERE activo = 1 AND estado_pago = 'aprobado' 
ORDER BY fecha_expiracion;

# Ver suscripciones expiradas
SELECT id, nombre, email, fecha_expiracion
FROM Usuarios 
WHERE activo = 0 AND estado_pago = 'expirado' 
ORDER BY fecha_expiracion DESC;

# Contar por estado
SELECT estado_pago, COUNT(*) as total 
FROM Usuarios 
GROUP BY estado_pago;
```

### Método 3: Endpoint API

```bash
# Obtener estado de suscripción de un usuario
curl https://tudominio.com/api/mercadopago/estado/USER_ID

# Respuesta:
{
  "suscripcionActiva": true,
  "estadoPago": "aprobado",
  "activo": true,
  "plan": "premium",
  "fecha_activacion": "2026-03-01T00:00:00.000Z",
  "fecha_expiracion": "2026-03-31T00:00:00.000Z",
  "diasRestantes": 22,
  "proximaRenovacion": "2026-03-31T00:00:00.000Z"
}
```

---

## 🛠️ Forzar Verificación Manual

### Opción 1: Desde el contenedor

```bash
docker-compose -f docker-compose.prod.yml exec api node -e \
  "import('./tasks/subscriptionChecker.js').then(m => m.verificarSuscripcionesExpiradas())"
```

### Opción 2: Reiniciar el servicio API

```bash
# Al reiniciar, se ejecuta una verificación inicial
docker-compose -f docker-compose.prod.yml restart api
```

---

## 🔧 Casos de Uso Comunes

### Activar usuario manualmente

```sql
-- Conectar a la base de datos
docker-compose -f docker-compose.prod.yml exec db mysql -ulexalia -p

USE lexalia;

-- Activar usuario y extender suscripción 30 días
UPDATE Usuarios 
SET activo = 1, 
    estado_pago = 'aprobado',
    fecha_activacion = NOW(),
    fecha_expiracion = DATE_ADD(NOW(), INTERVAL 30 DAY)
WHERE id = USER_ID;
```

### Extender suscripción

```sql
-- Extender 30 días más desde la fecha actual de expiración
UPDATE Usuarios 
SET fecha_expiracion = DATE_ADD(fecha_expiracion, INTERVAL 30 DAY)
WHERE id = USER_ID;
```

### Desactivar usuario manualmente

```sql
UPDATE Usuarios 
SET activo = 0, 
    estado_pago = 'expirado'
WHERE id = USER_ID;
```

---

## 📈 Estadísticas y Reportes

### Usuarios próximos a expirar (7 días)

```sql
SELECT id, nombre, email, plan, 
       fecha_expiracion,
       DATEDIFF(fecha_expiracion, NOW()) as dias_restantes
FROM Usuarios 
WHERE activo = 1 
  AND estado_pago = 'aprobado'
  AND fecha_expiracion BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
ORDER BY fecha_expiracion;
```

### Ingresos mensuales (aproximado)

```sql
-- Asumiendo $100,000 COP por mes
SELECT 
    DATE_FORMAT(fecha_activacion, '%Y-%m') as mes,
    COUNT(*) as suscripciones,
    COUNT(*) * 100000 as ingresos_aprox
FROM Usuarios
WHERE estado_pago = 'aprobado'
GROUP BY DATE_FORMAT(fecha_activacion, '%Y-%m')
ORDER BY mes DESC;
```

### Tasa de renovación

```sql
-- Usuarios que renovaron vs que expiraron
SELECT 
    (SELECT COUNT(*) FROM Usuarios WHERE estado_pago = 'aprobado') as activos,
    (SELECT COUNT(*) FROM Usuarios WHERE estado_pago = 'expirado') as expirados,
    ROUND(
        (SELECT COUNT(*) FROM Usuarios WHERE estado_pago = 'aprobado') * 100.0 / 
        (SELECT COUNT(*) FROM Usuarios WHERE estado_pago IN ('aprobado', 'expirado'))
    , 2) as tasa_retencion
FROM dual;
```

---

## 🐛 Troubleshooting

### Problema: Suscripciones no se desactivan automáticamente

**Solución:**

1. Verificar que el cron esté corriendo:
   ```bash
   docker-compose -f docker-compose.prod.yml logs api | grep "Tarea automática"
   ```
   Deberías ver: `⏰ Tarea automática de verificación de suscripciones activada`

2. Forzar verificación manual:
   ```bash
   docker-compose -f docker-compose.prod.yml restart api
   ```

3. Verificar logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f api
   ```

### Problema: Usuario pagó pero no se activó

**Solución:**

1. Verificar el webhook de MercadoPago:
   - URL correcta: `https://tudominio.com/api/mercadopago/webhook`
   - Debe estar registrado en el panel de MercadoPago

2. Ver logs del webhook:
   ```bash
   docker-compose -f docker-compose.prod.yml logs api | grep webhook
   ```

3. Verificar el pago en la base de datos:
   ```sql
   SELECT * FROM Planes 
   WHERE referencia_pago = 'LEX-XXXXX' 
   ORDER BY createdAt DESC;
   ```

### Problema: Contador de días incorrecto

**Causa:** El cálculo usa exactamente 30 días desde la fecha de inicio.

**Verificar:**

```sql
SELECT 
    id, nombre, fecha_activacion, fecha_expiracion,
    DATEDIFF(fecha_expiracion, fecha_activacion) as duracion_dias,
    DATEDIFF(fecha_expiracion, NOW()) as dias_restantes
FROM Usuarios
WHERE activo = 1 AND estado_pago = 'aprobado';
```

La columna `duracion_dias` debe ser **30** para todas las suscripciones nuevas.

---

## ✅ Verificación Post-Deploy

Después de desplegar, verifica:

1. **Cron funcionando:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs api | grep "Tarea automática"
   ```

2. **Webhook configurado:**
   - Panel de MercadoPago → Configuración → Webhooks
   - URL: `https://tudominio.com/api/mercadopago/webhook`

3. **Suscripciones actuales:**
   ```bash
   ./check-subscriptions.sh
   ```

4. **Test de pago:**
   - Registrar un abogado de prueba
   - Completar el pago (puede ser de $100 COP en pruebas)
   - Verificar que se active automáticamente
   - Verificar que `fecha_expiracion` sea 30 días después

---

## 📌 Notas Importantes

- ⏰ **30 días exactos**: No usa meses del calendario (evita problemas con meses de diferente duración)
- 🔄 **Verificación cada hora**: Puede haber hasta 1 hora de delay en desactivación
- 💾 **Base de datos es la fuente de verdad**: Siempre consulta la BD para verificar el estado real
- 🔔 **Notificaciones**: Actualmente no están implementadas, pero puedes añadirlas usando la función `obtenerUsuariosProxAExpirar()`

---

## 🔮 Mejoras Futuras (Opcional)

- [ ] Sistema de notificaciones por email 7 días antes de expirar
- [ ] Renovación automática con tarjeta guardada
- [ ] Dashboard de métricas de suscripciones
- [ ] Webhook de MercadoPago para renovaciones
- [ ] Logs de auditoría de cambios de suscripción
