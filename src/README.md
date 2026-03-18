# Marketplace UPEM

**Plataforma de compra-venta de productos de segunda mano para estudiantes de la Universidad Politécnica del Estado de México**

---

## Estado del Proyecto

**COMPLETAMENTE FUNCIONAL** - Integrado 100% con Supabase

- Autenticación completa (registro, login, perfil)
- CRUD de productos con subida de imágenes
- Sistema de favoritos persistente
- Chat en tiempo real entre usuarios
- Notificaciones en tiempo real
- Búsqueda y filtros avanzados
- Diseño responsive mobile-first
- Seguridad con Row Level Security

---

## Inicio Rápido

### 1. Configurar Supabase (Solo la primera vez)

#### Paso A: Ejecutar el esquema SQL
```bash
1. Ve a https://supabase.com/dashboard
2. Abre tu proyecto
3. Ve a "SQL Editor" → "New Query"
4. Copia y pega TODO el contenido de /utils/supabase/schema.sql
5. Haz clic en "Run"
```

#### Paso B: Crear buckets de Storage
```bash
1. Ve a "Storage" en el menú lateral
2. Crea dos buckets:
   - Nombre: product-images | Público: Activado | Tamaño máx: 5MB
   - Nombre: avatars | Público: Activado | Tamaño máx: 2MB
```

### 2. Usar la Aplicación

```bash
1. Abre la aplicación
2. Haz clic en "Registrarse"
3. Completa el formulario de registro
4. ¡Listo! Ya puedes usar todas las funciones
```

---

## 📁 Estructura del Proyecto

```
/
├── App.tsx                          # Componente principal con navegación
├── components/
│   ├── Header.tsx                   # Navegación superior
│   ├── Footer.tsx                   # Pie de página
│   ├── LoginForm.tsx                # Formulario de login
│   ├── RegisterForm.tsx             # Formulario de registro
│   ├── ExplorePage.tsx              # Página de exploración de productos
│   ├── ProductDetail.tsx            # Detalles de producto individual
│   ├── FavoritesPage.tsx            # Lista de favoritos
│   ├── MessagesPage.tsx             # Chat/mensajería
│   ├── NotificationsPage.tsx        # Notificaciones
│   ├── ProfilePage.tsx              # Perfil de usuario
│   └── ui/                          # Componentes Shadcn/UI
├── pages/
│   └── NuevoProductoPage.tsx        # Formulario de publicar producto
├── utils/
│   └── supabase/
│       ├── client.ts                # Cliente de Supabase
│       ├── hooks.ts                 # Hooks personalizados
│       ├── schema.sql               # Esquema de base de datos
│       └── datos-ejemplo.sql        # Datos de prueba opcionales
├── supabase/
│   └── functions/
│       └── server/
│           └── index.tsx            # Edge function de setup
└── styles/
    └── globals.css                  # Estilos globales con Tailwind
```

---

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS v4
- **Componentes**: Shadcn/UI
- **Backend**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **Tiempo Real**: Supabase Realtime
- **Iconos**: Lucide React

---

## 🎨 Características

### Autenticación y Usuarios
- Registro con email, contraseña y matrícula opcional
- Inicio de sesión seguro
- Perfil de usuario editable
- Subida de avatar
- Estadísticas personales

### Productos
- Publicar productos con formulario de 3 pasos
- Subir imagen del producto (hasta 5MB)
- Categorías: Libros, Electrónicos, Ropa, Apuntes, Otros
- Condiciones: Nuevo, Usado
- Ubicaciones dentro del campus
- Contador de vistas automático
- Productos similares por categoría

### Búsqueda y Filtros
- Búsqueda por título en tiempo real
- Filtrar por categoría
- Filtrar por condición
- Filtrar por rango de precio
- Ordenar por precio (mayor/menor)
- Ordenar por fecha (reciente/antiguo)

### Favoritos
- Agregar/quitar favoritos con un clic
- Persistencia en base de datos
- Sincronización automática
- Vista dedicada de favoritos

### Chat/Mensajería
- Conversaciones entre compradores y vendedores
- Mensajes en tiempo real
- Historial completo
- Búsqueda de conversaciones

### Notificaciones
- Sistema de notificaciones en tiempo real
- Tipos: sistema, mensajes, favoritos, ventas
- Marcar como leído
- Contador en header

---

## 🎨 Diseño

### Colores Institucionales UPEM
```css
/* Guinda - Color Principal */
--guinda-700: #7B1E3E

/* Verde - Color Secundario */
--verde-600: #2D8A3E
```

### Responsive Design
- ✅ Mobile-first (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)

---

## 🔐 Seguridad

### Row Level Security (RLS)
Todas las tablas tienen políticas de seguridad:
- Los usuarios solo pueden ver/editar sus propios datos
- Los productos son públicos para lectura
- Los mensajes solo son visibles para participantes
- Las notificaciones solo son visibles para el destinatario

### Validaciones
- Tamaño de imágenes (5MB productos, 2MB avatares)
- Tipos de archivo permitidos (solo imágenes)
- Autenticación requerida para acciones protegidas
- Sanitización de inputs

---

## 📚 Hooks Disponibles

```typescript
// Autenticación
const { user, profile, loading, login, register, logout, updateProfile } = useAuth();

// Productos
const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();

// Favoritos
const { favoriteIds, loading, toggleFavorite } = useFavorites(userId);

// Conversaciones
const { conversations, loading } = useConversations(userId);

// Mensajes
const { messages, loading, sendMessage } = useMessages(conversationId);

// Notificaciones
const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(userId);
```

---

## 📊 Base de Datos

### Tablas
```
profiles          - Perfiles de usuarios
products          - Productos publicados
favorites         - Favoritos de usuarios
conversations     - Conversaciones de chat
messages          - Mensajes entre usuarios
notifications     - Notificaciones del sistema
```

### Storage Buckets
```
product-images    - Imágenes de productos (público, 5MB max)
avatars          - Avatares de usuarios (público, 2MB max)
```

---

## 🧪 Datos de Prueba

Para agregar productos de ejemplo:

```bash
1. Ve a SQL Editor en Supabase
2. Obtén tu user_id:
   SELECT id FROM profiles WHERE email = 'tu@email.com';
3. Abre /utils/supabase/datos-ejemplo.sql
4. Reemplaza 'TU_USER_ID' con tu UUID real
5. Ejecuta el SQL
```

Esto creará 16 productos de ejemplo en diferentes categorías.

---

## 🐛 Solución de Problemas

### "relation does not exist"
**Solución**: Ejecuta el esquema SQL completo en Supabase

### "storage bucket not found"
**Solución**: Crea los buckets `product-images` y `avatars` en Storage

### "user not authenticated"
**Solución**: Cierra sesión y vuelve a iniciar sesión

### No aparecen productos
**Solución**: Publica un producto desde el botón "+ Vender algo"

---

## 📖 Documentación Completa

- **Setup Detallado**: Ver `/SETUP_COMPLETO.md`
- **Estado de Integración**: Ver `/INTEGRATION_STATUS.md`
- **Esquema SQL**: Ver `/utils/supabase/schema.sql`
- **Datos de Ejemplo**: Ver `/utils/supabase/datos-ejemplo.sql`

---

## 🎯 Roadmap Futuro

### Alta Prioridad
- [ ] Página "Mis Productos" (editar/eliminar)
- [ ] Crear conversación automática al contactar
- [ ] Paginación en lista de productos
- [ ] Múltiples imágenes por producto

### Media Prioridad
- [ ] Sistema de calificaciones/reseñas
- [ ] Historial de compras/ventas
- [ ] Notificaciones push
- [ ] Compartir en redes sociales

### Baja Prioridad
- [ ] Modo oscuro
- [ ] Estadísticas del vendedor
- [ ] Sistema de reportes
- [ ] Exportar datos

---

## 👥 Contribuir

Este es un proyecto educativo para la Universidad Politécnica del Estado de México.

---

## 📄 Licencia

Proyecto académico - UPEM 2024

---

## 🆘 Soporte

Para problemas o preguntas:
1. Revisa la documentación en `/SETUP_COMPLETO.md`
2. Consulta los ejemplos en `/utils/supabase/datos-ejemplo.sql`
3. Verifica el estado en `/INTEGRATION_STATUS.md`

---

## ✨ Características Destacadas

- 🔐 **Seguro**: Row Level Security en toda la base de datos
- ⚡ **Rápido**: Queries optimizados con índices
- 📱 **Responsive**: Funciona perfectamente en móviles
- 🎨 **Moderno**: Diseño limpio con Tailwind CSS
- 💬 **Tiempo Real**: Chat y notificaciones instantáneas
- 🖼️ **Multimedia**: Subida de imágenes optimizada
- 🔍 **Completo**: Búsqueda y filtros avanzados

---

**¡Hecho con 💚💜 para la comunidad UPEM!**
