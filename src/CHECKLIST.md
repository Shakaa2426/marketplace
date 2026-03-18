# Checklist de Configuración - Marketplace UPEM

Usa este checklist para verificar que todo está configurado correctamente.

---

## Configuración Inicial

### Paso 1: Base de Datos (OBLIGATORIO)

- [ ] **Abrí el panel de Supabase**
  - URL: https://supabase.com/dashboard
  - Proyecto actual: TU_PROJECT_ID

- [ ] **Ejecuté el esquema SQL completo**
  - Abrí SQL Editor → New Query
  - Copié TODO el contenido de `/utils/supabase/schema.sql`
  - Hice clic en "Run"
  - No hubo errores en la ejecución

- [ ] **Verifiqué que las tablas se crearon**
  - Abrí Table Editor
  - Veo 6 tablas: `profiles`, `products`, `favorites`, `conversations`, `messages`, `notifications`

### Paso 2: Storage (OBLIGATORIO)

- [ ] **Creé el bucket de product-images**
  - Storage → Create bucket
  - Nombre: `product-images`
  - Public: Activado
  - File size limit: 5242880 (5MB)
  - Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp

- [ ] **Creé el bucket de avatars**
  - Storage → Create bucket
  - Nombre: `avatars`
  - Public: Activado  
  - File size limit: 2097152 (2MB)
  - Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp

- [ ] **Verifiqué los buckets**
  - En Storage veo ambos buckets: `product-images` y `avatars`

---

## Verificación de Funcionalidades

### Autenticación

- [ ] **Puedo registrarme**
  - Abrí la aplicación
  - Hice clic en "Registrarse"
  - Completé el formulario
  - Se creó mi cuenta exitosamente
  - Fui redirigido a ExplorePage

- [ ] **Puedo iniciar sesión**
  - Cerré sesión
  - Hice clic en "Iniciar Sesión"
  - Ingresé mis credenciales
  - Inicié sesión exitosamente

- [ ] **Mi perfil se creó automáticamente**
  - En el header veo mi nombre
  - Puedo hacer clic en el ícono de perfil
  - Veo mi información correcta

### Productos

- [ ] **Puedo publicar un producto**
  - Hice clic en "+ Vender algo"
  - Completé los 3 pasos del formulario
  - Subí una imagen (opcional)
  - El producto se publicó exitosamente

- [ ] **Puedo ver productos en Explorar**
  - Veo el producto que publiqué
  - Los productos se muestran correctamente
  - Las imágenes cargan bien

- [ ] **Puedo ver detalles de producto**
  - Hice clic en un producto
  - Se abre la página de detalles
  - Veo toda la información correcta
  - El contador de vistas funciona

### Búsqueda y Filtros

- [ ] **Puedo buscar productos**
  - Escribí en la barra de búsqueda
  - Los resultados se filtran correctamente

- [ ] **Puedo filtrar por categoría**
  - Seleccioné una categoría
  - Solo veo productos de esa categoría

- [ ] **Puedo filtrar por condición**
  - Seleccioné "Nuevo" o "Usado"
  - Los productos se filtran correctamente

- [ ] **Puedo filtrar por precio**
  - Ingresé un rango de precio
  - Los productos se filtran correctamente

- [ ] **Puedo ordenar productos**
  - Probé ordenar por precio (mayor/menor)
  - Probé ordenar por fecha (reciente/antiguo)
  - El orden cambia correctamente

### Favoritos

- [ ] **Puedo agregar a favoritos**
  - Hice clic en el icono de corazón de un producto
  - El corazón se rellenó
  - El producto se agregó a favoritos

- [ ] **Puedo ver mis favoritos**
  - Hice clic en el ícono de corazón en el header
  - Veo todos mis favoritos
  - Los favoritos persisten al recargar

- [ ] **Puedo quitar de favoritos**
  - Hice clic nuevamente en el corazón
  - El producto se quitó de favoritos

### Chat/Mensajes

- [ ] **Puedo acceder a mensajes**
  - Hice clic en el ícono de mensajes
  - Se abre la página de chat
  - Veo la lista de conversaciones (puede estar vacía)

- [ ] **Puedo enviar mensajes** (requiere otra cuenta)
  - Contacté a un vendedor
  - Se creó una conversación
  - Pude enviar mensajes

### Notificaciones

- [ ] **Puedo ver notificaciones**
  - Hice clic en el ícono de campana
  - Se abre la página de notificaciones
  - Veo al menos la notificación de bienvenida

- [ ] **Puedo marcar como leída**
  - Hice clic en una notificación
  - Se marcó como leída
  - El contador disminuyó

### Perfil

- [ ] **Puedo ver mi perfil**
  - Hice clic en el ícono de usuario
  - Veo mi información completa
  - Veo mis estadísticas

- [ ] **Puedo editar mi perfil**
  - Hice clic en "Editar Perfil"
  - Cambié mi nombre
  - Los cambios se guardaron

- [ ] **Puedo subir avatar**
  - Hice clic en el botón de subir
  - Seleccioné una imagen
  - La imagen se subió correctamente
  - Veo mi avatar en el header

---

## Verificaciones Técnicas

### Base de Datos

- [ ] **Las tablas tienen RLS habilitado**
  - En Table Editor → cada tabla → Settings
  - "Enable Row Level Security" está activado

- [ ] **Los índices se crearon**
  - No veo errores de "could not create index"

- [ ] **Los triggers funcionan**
  - Al actualizar un producto, `updated_at` cambia automáticamente
  - Al registrarme, se creó mi perfil automáticamente

### Storage

- [ ] **Puedo subir imágenes de productos**
  - Subí una imagen al publicar producto
  - La imagen se guardó en `product-images`
  - Puedo ver la imagen en el producto

- [ ] **Puedo subir avatar**
  - Subí una imagen de perfil
  - La imagen se guardó en `avatars`
  - Veo mi avatar en el header

- [ ] **Las políticas de storage funcionan**
  - Las imágenes son públicas (puedo verlas sin auth)
  - Solo puedo subir/editar mis propias imágenes

### Tiempo Real

- [ ] **Las notificaciones llegan en tiempo real** (requiere otra cuenta)
  - Alguien agregó mi producto a favoritos
  - Recibí la notificación sin refrescar

- [ ] **Los mensajes llegan en tiempo real** (requiere otra cuenta)
  - Alguien me envió un mensaje
  - El mensaje apareció sin refrescar

---

## Datos de Prueba (Opcional)

- [ ] **Agregué datos de ejemplo**
  - Obtuve mi user_id: `SELECT id FROM profiles WHERE email = 'mi@email.com'`
  - Abrí `/utils/supabase/datos-ejemplo.sql`
  - Reemplacé 'TU_USER_ID' con mi UUID
  - Ejecuté el SQL
  - Veo 16 productos de ejemplo en Explorar

---

## Problemas Comunes y Soluciones

### ❌ "relation does not exist"
**Causa**: No ejecuté el esquema SQL
**Solución**: 
- [ ] Ejecuté `/utils/supabase/schema.sql` completo en SQL Editor

### ❌ "storage bucket not found"
**Causa**: No creé los buckets
**Solución**:
- [ ] Creé `product-images` en Storage
- [ ] Creé `avatars` en Storage

### ❌ "permission denied for table"
**Causa**: RLS mal configurado o no ejecuté las políticas
**Solución**:
- [ ] Ejecuté nuevamente el esquema SQL completo
- [ ] Verifiqué que RLS está habilitado en todas las tablas

### ❌ "user not authenticated"
**Causa**: Sesión expiró
**Solución**:
- [ ] Cerré sesión y volví a iniciar sesión

### ❌ Las imágenes no cargan
**Causa**: Buckets no son públicos
**Solución**:
- [ ] En Storage → cada bucket → Settings
- [ ] Activé "Public bucket"

### ❌ No aparecen productos
**Causa**: Base de datos vacía
**Solución**:
- [ ] Publiqué un producto desde "+ Vender algo"
- [ ] O ejecuté `/utils/supabase/datos-ejemplo.sql`

---

## Confirmación Final

Si marcaste TODOS los puntos obligatorios, tu marketplace está listo:

- [ ] Ejecuté el esquema SQL completo
- [ ] Creé ambos buckets de Storage
- [ ] Puedo registrarme e iniciar sesión
- [ ] Puedo publicar productos
- [ ] Puedo buscar y filtrar
- [ ] Puedo agregar favoritos
- [ ] Puedo ver mi perfil
- [ ] Las imágenes se suben correctamente

---

## Felicidades!

Si completaste este checklist, tu **Marketplace UPEM está 100% funcional**.

### Próximos pasos recomendados:
1. Comparte la app con otros estudiantes para probar el chat
2. Publica productos reales que quieras vender
3. Personaliza los colores o el diseño si lo deseas
4. Revisa el roadmap en `/README.md` para ver mejoras futuras

---

**Documentación adicional:**
- Setup completo: `/SETUP_COMPLETO.md`
- Estado de integración: `/INTEGRATION_STATUS.md`
- README general: `/README.md`
- Datos de ejemplo: `/utils/supabase/datos-ejemplo.sql`
