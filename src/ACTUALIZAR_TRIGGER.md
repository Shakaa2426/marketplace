# 🔧 Actualizar Trigger de Registro

## ⚠️ IMPORTANTE: Ejecuta este SQL en Supabase

El trigger para crear perfiles necesita ser actualizado para incluir la matrícula y tener permisos correctos.

### 📋 Pasos:

1. Ve a: **https://supabase.com/dashboard/project/nszyvlzrmsveajiuqukt/sql/new**

2. **Copia y pega** el siguiente SQL:

```sql
-- Primero, elimina TODAS las políticas de INSERT si existen
DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Sistema puede crear perfiles desde trigger" ON profiles;
DROP POLICY IF EXISTS "Usuarios y sistema pueden crear perfiles" ON profiles;

-- Crear política unificada que permite tanto al usuario como al sistema crear perfiles
CREATE POLICY "Usuarios y sistema pueden crear perfiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, matricula)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'matricula'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

3. Haz clic en **"Run"** (Ejecutar)

4. Verifica que aparezca "Success. No rows returned"

---

## ✅ Después de ejecutar:

Ya podrás registrar usuarios correctamente con todos los datos (nombre, email, contraseña y matrícula).

El sistema ahora:
- ✓ Crea el usuario en auth.users
- ✓ Crea automáticamente el perfil en la tabla profiles
- ✓ Auto-confirma el email (no requiere confirmación)
- ✓ Inicia sesión automáticamente después del registro

---

## 🔍 Verificar que funciona:

Después de ejecutar el SQL, intenta registrar un nuevo usuario. Si todo está bien:
- Se creará el usuario en auth.users
- Se creará automáticamente el perfil en la tabla profiles
- No habrá errores de "Email not confirmed"
- La sesión se iniciará automáticamente