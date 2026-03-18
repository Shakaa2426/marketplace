# Configuración de Autenticación - Supabase

## IMPORTANTE: Configurar para permitir login sin confirmación de email

Para que los usuarios puedan iniciar sesión inmediatamente después de registrarse (sin necesidad de confirmar el email), debes configurar Supabase:

---

## Pasos de configuración

### 1. Accede a la configuración de autenticación

Ve a: **https://supabase.com/dashboard/project/TU_PROJECT_ID/auth/providers**

### 2. Deshabilitar confirmación de email

1. En el menú lateral, ve a **Authentication** → **Providers**
2. Busca la sección **"Email"**
3. Desactiva la opción **"Confirm email"** (Confirmar email)
4. Haz clic en **"Save"** (Guardar)

**O también puedes hacerlo desde:**

Ve a: **https://supabase.com/dashboard/project/TU_PROJECT_ID/auth/url-configuration**

1. En el menú lateral, ve a **Authentication** → **Email Templates**
2. Desactiva **"Enable email confirmations"**
3. Guarda los cambios

---

## Configuración alternativa (si lo anterior no funciona)

Si aún tienes problemas, ve a la configuración general de auth:

**https://supabase.com/dashboard/project/TU_PROJECT_ID/settings/auth**

1. En **"User Signups"**, asegúrate de que esté habilitado
2. En **"Email Confirmation"**, desactiva la opción
3. Guarda los cambios

---

## Verificación

Una vez configurado correctamente:

1. Los usuarios podrán registrarse sin necesidad de confirmar su email
2. Después del registro, se iniciará sesión automáticamente
3. Los usuarios existentes podrán iniciar sesión sin problemas

---

## Notas importantes

- Esta configuración es ideal para desarrollo y prototipos
- En producción, se recomienda habilitar la confirmación de email para mayor seguridad
- Si planeas usar confirmación de email en el futuro, necesitarás configurar un servidor SMTP

---

## Si los problemas persisten

Si después de esta configuración sigues teniendo problemas de autenticación:

1. Verifica que el esquema SQL se haya ejecutado correctamente
2. Comprueba que la tabla `profiles` existe
3. Revisa la consola del navegador para ver errores específicos
4. Intenta crear un usuario nuevo para probar
