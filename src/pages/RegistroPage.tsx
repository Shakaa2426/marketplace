import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Eye, EyeOff, Loader2, CheckCircle, Check, X } from 'lucide-react';

interface RegistroPageProps {
  onRegistro: (data: {
    email: string;
    password: string;
    nombre: string;
    matricula?: string;
  }) => Promise<void>;
  onNavigate: (page: string) => void;
}

export function RegistroPage({ onRegistro, onNavigate }: RegistroPageProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    matricula: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validaciones simuladas (solo visuales, no aplican restricciones)
  const passwordValidations = {
    minLength: formData.password.length >= 6,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  // Calcular "fortaleza" simulada
  const getPasswordStrength = () => {
    if (formData.password.length === 0) return { label: '', color: '', width: 0 };
    
    const validCount = Object.values(passwordValidations).filter(Boolean).length;
    
    if (validCount <= 1) return { label: 'Débil', color: 'bg-error-500', width: 25 };
    if (validCount === 2) return { label: 'Regular', color: 'bg-warning-500', width: 50 };
    if (validCount === 3) return { label: 'Buena', color: 'bg-verde-500', width: 75 };
    return { label: 'Excelente', color: 'bg-verde-600', width: 100 };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!aceptoTerminos) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await onRegistro({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        matricula: formData.matricula || undefined
      });
      setSuccess(true);
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-verde-600 mx-auto mb-4" />
          <h2 className="text-neutral-900 mb-2">¡Cuenta creada exitosamente!</h2>
          <p className="text-neutral-600">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-neutral-900 mb-2">Crear Cuenta Universitaria</h1>
          <p className="text-neutral-600">Únete al Marketplace de la UPEM</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre completo */}
            <div>
              <label htmlFor="nombre" className="block text-sm mb-2 text-neutral-700">
                Nombre completo *
              </label>
              <input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                placeholder="Juan Pérez García"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-neutral-700">
                Correo electrónico *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                placeholder="tu.email@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-neutral-700">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Barra de fortaleza */}
              {formData.password && (
                <>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.width}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${
                    passwordStrength.label === 'Débil' ? 'text-error-600' :
                    passwordStrength.label === 'Regular' ? 'text-warning-600' :
                    'text-verde-600'
                  }`}>
                    Fortaleza: {passwordStrength.label}
                  </p>
                </>
              )}
              
              {/* Requisitos simulados */}
              {formData.password && (
                <div className="mt-3 space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-neutral-600 mb-2">Requisitos recomendados:</p>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidations.minLength ? (
                      <Check className="w-4 h-4 text-verde-600" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={passwordValidations.minLength ? 'text-verde-600' : 'text-gray-500'}>
                      Mínimo 6 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidations.hasUpperCase ? (
                      <Check className="w-4 h-4 text-verde-600" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={passwordValidations.hasUpperCase ? 'text-verde-600' : 'text-gray-500'}>
                      Al menos una mayúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidations.hasLowerCase ? (
                      <Check className="w-4 h-4 text-verde-600" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={passwordValidations.hasLowerCase ? 'text-verde-600' : 'text-gray-500'}>
                      Al menos una minúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidations.hasNumber ? (
                      <Check className="w-4 h-4 text-verde-600" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={passwordValidations.hasNumber ? 'text-verde-600' : 'text-gray-500'}>
                      Al menos un número
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 italic">
                    * Estos son solo recomendaciones. Puedes usar cualquier contraseña de 6+ caracteres.
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm mb-2 text-neutral-700">
                Confirmar contraseña *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-error-500'
                      : 'border-neutral-300'
                  }`}
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 mt-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-verde-600" />
                      <p className="text-xs text-verde-600">Las contraseñas coinciden</p>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-error-600" />
                      <p className="text-xs text-error-600">Las contraseñas no coinciden</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Matrícula */}
            <div>
              <label htmlFor="matricula" className="block text-sm mb-2 text-neutral-700">
                Matrícula (opcional)
              </label>
              <input
                id="matricula"
                type="text"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                placeholder="Ej: 202403001 o 20-UPVM-123456"
              />
            </div>

            {/* Términos */}
            <div className="flex items-start gap-2">
              <input
                id="terminos"
                type="checkbox"
                checked={aceptoTerminos}
                onChange={(e) => setAceptoTerminos(e.target.checked)}
                className="mt-1 w-4 h-4 text-guinda-700 border-neutral-300 rounded focus:ring-guinda-700"
              />
              <label htmlFor="terminos" className="text-sm text-neutral-700">
                Acepto los{' '}
                <a href="#" className="text-guinda-700 hover:text-guinda-800">
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="text-guinda-700 hover:text-guinda-800">
                  política de privacidad
                </a>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Enlaces */}
          <div className="mt-6 text-center text-sm text-neutral-600">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-guinda-700 hover:text-guinda-800"
            >
              Inicia sesión aquí
            </button>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center mt-6">
          <button
            onClick={() => onNavigate('home')}
            className="text-neutral-600 hover:text-neutral-900"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}