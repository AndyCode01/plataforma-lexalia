# Guía de Prueba del Flujo Completo

## Estado actual
✅ Backend corriendo en http://localhost:4000  
✅ Frontend corriendo en http://localhost:5173  
✅ Base de datos MySQL en Docker  
✅ Simulación de pago activada (sin necesidad de MercadoPago por ahora)

## Flujo completo de prueba

### 1. Registro de nuevo abogado
1. Abre http://localhost:5173/registro
2. Llena el formulario:
   - Nombre: `María González`
   - Email: `maria.gonzalez@test.com`
   - Contraseña: `123456` (mínimo 6 caracteres)
   - Plan: elige el que quieras (Básico, Pro, Premium)
3. Haz clic en "Registrar y pagar"
4. Deberías ver: "✓ Registro y pago exitoso"
5. En la consola del backend verás: `✅ Pago simulado para usuario X - Plan basico activado`

### 2. Verificar en la base de datos
```powershell
docker exec -it lexalia-db mysql -uroot -proot -e "SELECT id, nombre, email, activo, estado_pago, plan FROM lexalia.usuarios;"
```
Deberías ver el usuario con `activo=1`, `estado_pago='aprobado'` y el plan seleccionado.

### 3. Iniciar sesión
1. Desde la página de éxito, haz clic en "Iniciar sesión" o ve a http://localhost:5173/login
2. Ingresa:
   - Email: `maria.gonzalez@test.com`
   - Contraseña: `123456`
3. Haz clic en "Iniciar sesión"
4. Serás redirigido automáticamente a `/mi-perfil`

### 4. Editar perfil
1. En la página "Mi Perfil" verás:
   - Tus datos básicos (nombre, email, plan, fecha de expiración)
   - Formulario para editar tu perfil profesional
2. Completa los campos:
   - Especialidad: `Derecho Laboral`
   - Ciudad: `Medellín`
   - Años de experiencia: `5`
   - Teléfono: `+57 300 123 4567`
   - Email público: `contacto@mariagonzalez.com`
   - Descripción: `Abogada especializada en derecho laboral con 5 años de experiencia...`
   - Idiomas: `Español, Inglés`
   - Educación: `Universidad Nacional, Especialización en Derecho Laboral`
3. (Opcional) Selecciona una foto de perfil
4. Haz clic en "Guardar cambios"
5. Deberías ver: "✓ Perfil actualizado exitosamente"

### 5. Verificar cambios en el catálogo
1. Ve a http://localhost:5173/#catalogo
2. Busca tu perfil en el catálogo de abogados
3. Haz clic en "Ver perfil" para ver el modal con tu información actualizada
4. Deberías ver todos los datos que acabas de editar

### 6. Verificar en la base de datos
```powershell
docker exec -it lexalia-db mysql -uroot -proot -e "SELECT id, usuario_id, especialidad, ciudad, experiencia, telefono FROM lexalia.abogados WHERE usuario_id=(SELECT id FROM lexalia.usuarios WHERE email='maria.gonzalez@test.com');"
```

### 7. Cerrar sesión y volver a entrar
1. En el Navbar, haz clic en "Cerrar sesión"
2. Verás que el menú cambió: ahora muestra "Iniciar sesión" y "Regístrate"
3. Vuelve a iniciar sesión con las mismas credenciales
4. Tu perfil debería conservar todos los cambios

## Funcionalidades implementadas

✅ **Registro con pago simulado**: Crea usuario + perfil de abogado + plan activo automáticamente  
✅ **Login con JWT**: Autenticación segura con token en localStorage  
✅ **Protección de rutas**: Solo usuarios autenticados acceden a /mi-perfil  
✅ **Edición de perfil**: Actualiza especialidad, ciudad, experiencia, teléfono, descripción, idiomas, educación  
✅ **Subida de foto**: UI lista (por ahora genera avatar automático; listo para integrar Cloudinary)  
✅ **Navbar dinámico**: Muestra opciones diferentes según estado de autenticación  
✅ **Persistencia de sesión**: Al recargar la página, el usuario sigue logueado

## Notas importantes

- **Foto de perfil**: Por ahora genera un avatar con las iniciales. Para subida real, integra Cloudinary o AWS S3.
- **MercadoPago**: El flujo de pago está simulado con el endpoint `/api/mercadopago/simular-pago`. Cuando tengas el token correcto, descomenta el código de producción en `RegistroAbogado.jsx`.
- **Validaciones**: El backend valida que solo el dueño del perfil (o admin) pueda editarlo.

## Comandos útiles

### Limpiar base de datos para nuevas pruebas
```powershell
docker exec -it lexalia-db mysql -uroot -proot -e "DELETE FROM lexalia.abogados; DELETE FROM lexalia.planes; DELETE FROM lexalia.usuarios;"
```

### Ver todos los usuarios
```powershell
docker exec -it lexalia-db mysql -uroot -proot -e "SELECT id, nombre, email, rol, activo, plan FROM lexalia.usuarios;"
```

### Ver todos los perfiles de abogados
```powershell
docker exec -it lexalia-db mysql -uroot -proot -e "SELECT id, usuario_id, especialidad, ciudad, experiencia FROM lexalia.abogados;"
```

## Próximos pasos sugeridos

1. Integrar subida real de fotos (Cloudinary o AWS S3)
2. Configurar MercadoPago con token de prueba real y probar webhook
3. Agregar panel de admin para gestionar usuarios y planes
4. Implementar cambio de contraseña
5. Agregar recuperación de contraseña por email
