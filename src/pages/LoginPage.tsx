import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onNavigate: (page: string) => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-neutral-900 mb-2">Iniciar Sesión</h1>
          <p className="text-neutral-600">Accede a tu cuenta del Marketplace UPEM</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-neutral-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                placeholder="tu.email@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-neutral-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
              {loading ? 'Iniciando sesión...' : 'Ingresar a mi cuenta'}
            </button>
          </form>

          {/* Enlaces */}
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => {/* TODO: Recuperar contraseña */}}
              className="text-sm text-guinda-700 hover:text-guinda-800 block w-full"
            >
              ¿Olvidaste tu contraseña?
            </button>
            <div className="text-sm text-neutral-600">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => onNavigate('registro')}
                className="text-guinda-700 hover:text-guinda-800"
              >
                Regístrate aquí
              </button>
            </div>
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
