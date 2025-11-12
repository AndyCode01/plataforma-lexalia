# Script para crear usuario administrador

Este script crea un usuario administrador en la base de datos para acceder al panel de administración.

## Crear usuario admin

Ejecuta este comando en PowerShell desde la raíz del proyecto:

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"nombre":"Admin","email":"admin@lexalia.com","password":"admin123","plan":"premium"}' | Select-Object -ExpandProperty Content
```

O usa este script Node.js:

```javascript
// crear-admin.js
import fetch from 'node-fetch';

async function crearAdmin() {
  try {
    // 1. Registrar usuario admin
    const res = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Admin',
        email: 'admin@lexalia.com',
        password: 'admin123',
        plan: 'premium'
      })
    });
    
    const data = await res.json();
    console.log('Usuario creado:', data);
    
    // 2. Actualizar el rol a admin directamente en la base de datos
    console.log('\nEjecuta este comando para hacer al usuario administrador:');
    console.log(`docker exec -it lexalia-db mysql -uroot -proot -e "UPDATE lexalia.usuarios SET rol='admin' WHERE email='admin@lexalia.com';"`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

crearAdmin();
```

## Pasos manuales:

1. **Registrar el usuario** (puedes usar Postman o curl):
   ```bash
   curl -X POST http://localhost:4000/api/auth/register \
     -H "Content-Type: application/json" \
     -d "{\"nombre\":\"Admin\",\"email\":\"admin@lexalia.com\",\"password\":\"admin123\",\"plan\":\"premium\"}"
   ```

2. **Actualizar el rol a admin** en la base de datos:
   ```bash
   docker exec -it lexalia-db mysql -uroot -proot -e "UPDATE lexalia.usuarios SET rol='admin' WHERE email='admin@lexalia.com';"
   ```

3. **Iniciar sesión** en http://localhost:5173/login con:
   - Email: `admin@lexalia.com`
   - Contraseña: `admin123`

4. **Acceder al panel** en http://localhost:5173/admin

## Credenciales del administrador

- **Email:** admin@lexalia.com
- **Contraseña:** admin123
- **Rol:** admin
