# Cómo probar el sistema de notificaciones de mensajes

## Sistema implementado al 100%

El sistema de notificaciones de mensajes ya está completamente funcional. Aquí te explico cómo probarlo:

---

## Prueba con 2 usuarios

### Opción 1: Dos navegadores diferentes

1. **Navegador 1 (Chrome):**
   - Inicia sesión con Usuario A
   - Ejemplo: `usuario1@upvm.edu.mx`

2. **Navegador 2 (Firefox/Edge):**
   - Inicia sesión con Usuario B
   - Ejemplo: `usuario2@upvm.edu.mx`

### Opción 2: Navegador normal + modo incógnito

1. **Navegador normal:**
   - Inicia sesión con Usuario A

2. **Modo incógnito (Ctrl+Shift+N):**
   - Inicia sesión con Usuario B

---

## Pasos para probar

### 1. Configuración inicial

**Usuario A:**
- Publicar un producto (si no tiene)
- Ir a "Explorar"

**Usuario B:**
- Ver el producto de Usuario A
- Click en "Contactar Vendedor"
- Se crea conversación automática

---

### 2. Enviar mensaje

**Usuario B:**
1. Escribe un mensaje: "Hola, ¿está disponible?"
2. Click en botón de enviar
3. El mensaje aparece en azul/guinda

**¿Qué debería pasar?**
- Mensaje enviado correctamente
- Se crea notificación en base de datos para Usuario A

---

### 3. Ver notificación (Usuario A)

**En el navegador de Usuario A:**

1. **Badge rojo aparece automáticamente:**
   ```
   Icono de campana (con círculo rojo y número "1")
   ```

2. **Click en campanita:**
   - Se abre página de Notificaciones
   - Ves una notificación destacada con fondo guinda claro
   - Dice: "Nuevo mensaje"
   - Mensaje: "Tienes un mensaje nuevo sobre [nombre del producto]"
   - Tiene un indicador indicando que no está leída

3. **Click en la notificación:**
   - Se marca como leída
   - Navega automáticamente a "Mensajes"
   - Abre la conversación correcta
   - Ves el mensaje de Usuario B
   - Puedes responder inmediatamente

---

### 4. Responder (Usuario A)

**Usuario A responde:**
1. Escribe: "Sí, disponible. ¿Te interesa?"
2. Click en enviar
3. El mensaje aparece en la conversación

**Usuario B ahora recibe notificación:**
- Badge rojo en su campanita
- Al hacer click, se repite el proceso

---

## Flujo visual completo

```
USUARIO B envía mensaje
         ↓
📨 "Hola, ¿está disponible?"
         ↓
         
USUARIO A (automático):
  🔴 Badge aparece en 🔔
  1️⃣ Contador de notificaciones
         ↓
         
USUARIO A hace click en 🔔:
  📋 Lista de notificaciones
  🟣 Destacada con fondo guinda
  💬 "Nuevo mensaje sobre [producto]"
  • Puntito rojo (no leída)
         ↓
         
USUARIO A hace click en notificación:
  ✅ Marca como leída
  📱 Abre Mensajes
  💬 Conversación seleccionada
  👀 Ve mensaje de Usuario B
         ↓
         
USUARIO A puede responder
```

---

## 🐛 Si no funciona, verifica:

### 1. Base de datos
- ✅ Tabla `notifications` existe
- ✅ Campo `link` permite NULL o TEXT
- ✅ Campo `type` permite 'message'

### 2. Permisos en Supabase
```sql
-- Verificar que existen estas políticas:
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

### 3. Console del navegador
- F12 → Pestaña "Console"
- Buscar errores en rojo
- Si hay error de permisos → Revisar RLS en Supabase

### 4. Network
- F12 → Pestaña "Network"
- Enviar mensaje
- Ver si aparece request a `notifications` (INSERT)
- Si no aparece → Problema en el código
- Si aparece con error → Problema en permisos

---

## 🎨 Cómo se ve visualmente

### Badge de notificaciones (Header)
```
┌─────────────────────────────────┐
│  🏠  🔍  🔔¹  💬  ❤️  👤       │
│         └─ Círculo rojo        │
└─────────────────────────────────┘
```

### Página de notificaciones
```
┌─────────────────────────────────────┐
│ Notificaciones                   1  │
│                                     │
│ ╔═════════════════════════════════╗ │
│ ║ 💬 Nuevo mensaje            • ║ │ ← No leída
│ ║ Tienes un mensaje nuevo...     ║ │
│ ║ Hace 1 min                      ║ │
│ ╚═════════════════════════════════╝ │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ ✅ Bienvenido                 │   │ ← Leída
│ │ Gracias por unirte...         │   │
│ │ Hace 2 días                   │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Al hacer click → Página de mensajes
```
┌─────────────────────────────────────┐
│ ← Volver                            │
│                                     │
│ ┌──────────┬────────────────────┐   │
│ │ Chats    │  💬 Conversación   │   │
│ ├──────────┤                    │   │
│ │ 👤 Juan  │  Hola, ¿está       │   │ ← Mensaje
│ │ Laptop   │  disponible?       │   │   abierto
│ │          │                    │   │
│ │          │  [Escribe...]  📤  │   │
│ └──────────┴────────────────────┘   │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de funcionalidades

- ✅ Enviar mensaje crea notificación automáticamente
- ✅ Badge rojo aparece en campanita
- ✅ Contador de notificaciones funciona
- ✅ Notificaciones en tiempo real (Supabase Realtime)
- ✅ Click en notificación marca como leída
- ✅ Click en notificación navega a conversación
- ✅ Conversación se abre automáticamente
- ✅ Puede responder desde ahí
- ✅ Sistema bidireccional (A→B y B→A)

---

## 🚀 ¡Todo funcional!

Si sigues estos pasos, deberías ver el sistema de notificaciones funcionando perfectamente. Si hay algún problema, revisa la consola del navegador (F12) para ver los errores específicos.

**¿Necesitas ayuda?** Revisa `/CAMBIOS-IMPLEMENTADOS.md` para detalles técnicos de la implementación.
