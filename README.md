# Marketplace UPVM

!Estado: Completamente Funcional
!React
!TypeScript
!Supabase
!TailwindCSS

**Plataforma de compra-venta de productos de segunda mano para estudiantes de la Universidad Politécnica del Estado de México (UPVM).**

El diseño original del proyecto se encuentra disponible en Figma.

---

## Características Principales

- **Autenticación completa**: Registro, inicio de sesión seguro y perfiles de usuario.
- **CRUD de productos**: Publica productos con imágenes (límite de 5MB), categorías y detalles.
- **Sistema de favoritos**: Guarda los productos que más te interesan de forma persistente.
- **Chat en tiempo real**: Comunícate directamente entre compradores y vendedores.
- **Notificaciones en tiempo real**: Entérate al instante de nuevos mensajes y actualizaciones.
- **Búsqueda y filtros avanzados**: Busca por categoría, condición, y precio.
- **Diseño Responsive**: Optimizado para dispositivos móviles, tablets y escritorio.

---

## Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Vite
- **Estilos**: Tailwind CSS v4, Componentes de Shadcn/UI, Lucide React (Iconos)
- **Backend & Base de Datos**: Supabase (PostgreSQL)
- **Autenticación & Storage**: Supabase Auth, Supabase Storage
- **Tiempo Real**: Supabase Realtime

---

## Guía de Instalación y Ejecución

Sigue estos pasos para levantar el entorno de desarrollo local.

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/Shakaa2426/marketplace-escolar.git
cd marketplace-escolar
npm install
```

### 2. Configurar la Base de Datos en Supabase

El proyecto requiere conectarse a un proyecto de Supabase para la base de datos y la persistencia:
1. Ve a Supabase Dashboard y crea o entra a tu proyecto.
2. En el menú lateral, ve a **SQL Editor** -> **New Query**.
3. Copia y pega el contenido completo de `src/utils/supabase/schema.sql` y haz clic en "Run".
4. Ve a **Storage** y crea dos buckets asegurándote de marcarlos como **Públicos**:
   - `product-images` 
   - `avatars` 

*(Para resolver cualquier duda o error durante este paso, consulta `src/SETUP_SUPABASE.md`)*

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto y agrega tus credenciales de Supabase (nunca subas este archivo a GitHub):

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre http://localhost:5173 en tu navegador para ver la aplicación.

---

## Estructura del Proyecto

La arquitectura de la aplicación está dividida principalmente dentro de la carpeta `src/`:
- `/components`: Componentes de interfaz, navegación y diseño (`Header.tsx`, `LoginForm.tsx`, UI de Shadcn, etc).
- `/pages`: Vistas principales de enrutamiento.
- `/utils/supabase`: Cliente, configuración de entorno, hooks reutilizables (`useAuth`, `useProducts`) y archivos SQL.
- `/styles`: Hojas de estilo y directivas de TailwindCSS.

---

## Licencia

Proyecto académico - UPVM 2024. ¡Hecho para la comunidad UPVM!
