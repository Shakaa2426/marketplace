import { useState } from 'react';
import { ShoppingBag, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../utils/supabase/hooks';
import { toast } from 'sonner@2.0.3';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onRegisterClick: () => void;
  onBack: () => void;
}

export function LoginForm({ onLoginSuccess, onRegisterClick, onBack }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        let errorMessage = 'Email o contraseña incorrectos';
        
        if (error.includes('Email not confirmed')) {
          errorMessage = 'Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico para confirmar tu cuenta o espera unos minutos e intenta de nuevo.';
        } else if (error.includes('Invalid login credentials')) {
          errorMessage = 'El email o la contraseña son incorrectos. Por favor, verifica tus datos e intenta nuevamente.';
        } else if (error.includes('User not found')) {
          errorMessage = 'No existe una cuenta con este email. Por favor, regístrate primero.';
        } else if (error.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos de inicio de sesión. Por favor, espera unos minutos e intenta nuevamente.';
        } else if (error.includes('fetch') || error.includes('conexión')) {
          errorMessage = 'Error de conexión. Por favor verifica tu conexión a internet y vuelve a intentar.';
        }
        
        toast.error('Error al iniciar sesión', {
          description: errorMessage,
          duration: 5000,
        });
      } else if (data?.user) {
        toast.success('¡Bienvenido de vuelta!');
        onLoginSuccess();
      } else {
        toast.error('Error al iniciar sesión', {
          description: 'Por favor, intenta nuevamente'
        });
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      toast.error('Error inesperado', {
        description: 'Por favor, verifica tu conexión e intenta nuevamente',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Botón de regreso */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-guinda-700 to-guinda-900 rounded-2xl mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-guinda-900 mb-2">Iniciar Sesión</h2>
          <p className="text-gray-600">Bienvenido de vuelta al Marketplace UPEM</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-guinda-600" />
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-guinda-600" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Olvidaste contraseña */}
            <div className="flex justify-end">
              <a href="#" className="text-sm text-guinda-700 hover:text-guinda-900">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón submit */}
            <Button
              type="submit"
              className="w-full bg-guinda-700 hover:bg-guinda-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Ingresar a mi cuenta'}
            </Button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          {/* Link a registro */}
          <p className="text-center text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-guinda-700 hover:text-guinda-900"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        {/* Información adicional */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Solo estudiantes de la Universidad Politécnica del Estado de México pueden registrarse
        </p>
      </div>
    </div>
  );
}