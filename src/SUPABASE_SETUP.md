# Configuración de Supabase para Marketplace UPEM

## Pasos para configurar la base de datos

### 1. Acceder al Panel de Supabase

Abre tu proyecto en Supabase:
**https://supabase.com/dashboard/project/TU_PROJECT_ID**

### 2. Ejecutar el Esquema de Base de Datos

1. En el menú lateral, ve a **SQL Editor**
2. Haz clic en **New query**
3. Copia y pega todo el contenido del archivo `/utils/supabase/schema.sql`
4. Haz clic en **Run** para ejecutar el SQL

Esto creará todas las tablas necesarias:
- `profiles` - Perfiles de usuarios
- `products` - Publicaciones de productos
- `favorites` - Favoritos de usuarios
- `conversations` - Conversaciones entre usuarios
- `messages` - Mensajes del chat
- `notifications` - Notificaciones

### 3. Configurar Storage para Imágenes

#### 3.1 Crear los buckets

1. En el menú lateral, ve a **Storage**
2. Haz clic en **Create a new bucket**
3. Crea dos buckets:
   - **Nombre**: `product-images`, **Public**: Activado
   - **Nombre**: `avatars`, **Public**: Activado

#### 3.2 Configurar políticas de Storage

Ejecuta este SQL en el **SQL Editor**:

```sql
-- Políticas para product-images
CREATE POLICY "Imágenes de productos públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Usuarios pueden subir imágenes de productos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios pueden actualizar sus imágenes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuarios pueden eliminar sus imágenes"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas para avatars
CREATE POLICY "Avatares públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios pueden subir avatares"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios pueden actualizar su avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuarios pueden eliminar su avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Configurar Email de Autenticación

1. Ve a **Authentication** → **Settings**
2. En **Email Templates**, personaliza los emails:
   - Confirm signup
   - Reset password
   - Magic Link

3. En **Auth Providers**, asegúrate de que **Email** esté habilitado

### 5. (Opcional) Agregar datos de prueba

Puedes ejecutar este SQL para crear algunos productos de ejemplo:

```sql
-- Primero, necesitas un usuario de prueba
-- Regístrate manualmente en tu app o usa este SQL:

-- Insertar productos de ejemplo (reemplaza 'USER_ID' con tu ID de usuario)
INSERT INTO products (user_id, title, description, price, category, condition, available) VALUES
  ('USER_ID', 'Cálculo Diferencial e Integral - Stewart', 'Libro en excelente estado, con algunas anotaciones útiles. Perfecto para estudiantes de ingeniería.', 250, 'Libros', 'Usado', true),
  ('USER_ID', 'Laptop HP Core i5 8GB RAM', 'Laptop en buen estado, funciona perfectamente. Incluye cargador.', 5000, 'Electrónicos', 'Usado', true),
  ('USER_ID', 'Apuntes Completos Termodinámica', 'Apuntes del semestre completo, escaneados y en formato PDF.', 50, 'Apuntes', 'Nuevo', true);
```

### 6. Verificar que todo funciona

1. Ve a **Table Editor** en el panel de Supabase
2. Verifica que todas las tablas se crearon correctamente
3. Ve a **Storage** y verifica que los buckets están creados
4. Intenta registrarte en tu aplicación

## Seguridad y Políticas RLS

**Row Level Security (RLS)** está habilitado en todas las tablas
Los usuarios solo pueden ver/editar su propia información
Las políticas están configuradas para máxima seguridad

## Estructura de la Base de Datos

```
profiles
├── id (UUID, PK)
├── full_name (TEXT)
├── email (TEXT)
├── matricula (TEXT, opcional)
├── avatar_url (TEXT, opcional)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

products
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── title (TEXT)
├── description (TEXT)
├── price (DECIMAL)
├── category (TEXT)
├── condition (TEXT)
├── location (TEXT)
├── image_url (TEXT)
├── available (BOOLEAN)
├── views (INTEGER)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

favorites
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── product_id (UUID, FK → products)
└── created_at (TIMESTAMPTZ)

conversations
├── id (UUID, PK)
├── product_id (UUID, FK → products)
├── buyer_id (UUID, FK → profiles)
├── seller_id (UUID, FK → profiles)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

messages
├── id (UUID, PK)
├── conversation_id (UUID, FK → conversations)
├── sender_id (UUID, FK → profiles)
├── content (TEXT)
├── is_read (BOOLEAN)
└── created_at (TIMESTAMPTZ)

notifications
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── type (TEXT)
├── title (TEXT)
├── message (TEXT)
├── link (TEXT)
├── is_read (BOOLEAN)
└── created_at (TIMESTAMPTZ)
```

## 🛠️ Hooks Disponibles

Los siguientes hooks están listos para usar en tus componentes:

- `useAuth()` - Autenticación y manejo de sesión
- `useProducts()` - CRUD de productos
- `useFavorites(userId)` - Manejo de favoritos
- `useConversations(userId)` - Conversaciones
- `useMessages(conversationId)` - Mensajes en tiempo real
- `useNotifications(userId)` - Notificaciones en tiempo real

## 🎯 Próximos Pasos

Después de configurar Supabase:

1. ✅ Ejecutar el esquema SQL
2. ✅ Crear los buckets de Storage
3. ✅ Configurar las políticas de Storage
4. 🔄 Los componentes ya están listos para conectarse automáticamente
5. 🚀 ¡Tu marketplace estará 100% funcional con persistencia de datos!

## ⚠️ Notas Importantes

- Las credenciales de Supabase YA están configuradas en `/utils/supabase/info.tsx`
- NO compartas tu `publicAnonKey` en repositorios públicos
- Los hooks manejan automáticamente subscripciones en tiempo real
- Las imágenes se almacenan en Supabase Storage
- Todos los datos persisten entre sesiones

## 🆘 Solución de Problemas

### "relation does not exist"
→ Asegúrate de haber ejecutado el esquema SQL completo

### "storage bucket not found"
→ Crea los buckets manualmente en Storage

### "permission denied"
→ Verifica que las políticas RLS están configuradas correctamente

### "user not authenticated"
→ Asegúrate de estar logueado antes de hacer operaciones protegidas
