import { useState } from 'react';
import { ShoppingBag, Eye, EyeOff, Mail, Lock, User, IdCard, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { useAuth } from '../utils/supabase/hooks';
import { toast } from 'sonner@2.0.3';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onLoginClick: () => void;
  onBack: () => void;
}

export function RegisterForm({ onRegisterSuccess, onLoginClick, onBack }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    matricula: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.length < 3) {
      newErrors.fullName = 'El nombre completo es requerido (mínimo 3 caracteres)';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    console.log('Iniciando registro...');
    
    // Primero registrar el usuario
    const { data: signUpData, error: signUpError } = await signUp(
      formData.email, 
      formData.password, 
      formData.fullName,
      formData.matricula || undefined
    );
    
    console.log('Resultado de registro:', { signUpData, signUpError });
    
    if (signUpError) {
      console.error('Error en registro:', signUpError);
      let errorMessage = signUpError;
      
      if (signUpError.includes('already registered') || signUpError.includes('already been registered')) {
        errorMessage = 'Este email ya está registrado';
      } else if (signUpError.includes('invalid') || signUpError.includes('Invalid')) {
        errorMessage = 'Email o contraseña inválidos';
      }
      
      toast.error('Error al crear cuenta', {
        description: errorMessage
      });
      setIsLoading(false);
      return;
    }

    // Esperar un momento para que la confirmación se procese
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Luego iniciar sesión automáticamente
    console.log('Intentando iniciar sesión automáticamente...');
    const { data: signInData, error: signInError } = await signIn(
      formData.email,
      formData.password
    );

    if (signInError) {
      console.error('Error al iniciar sesión automática:', signInError);
      // Si falla el login automático, mostrar mensaje pero indicar éxito
      toast.success('¡Cuenta creada exitosamente!', {
        description: 'Por favor, inicia sesión'
      });
      setIsLoading(false);
      onLoginClick(); // Redirigir a login
    } else {
      console.log('Login exitoso');
      toast.success('¡Cuenta creada e iniciada exitosamente!', {
        description: 'Bienvenido al Marketplace UPEM'
      });
      onRegisterSuccess();
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
          <h2 className="text-guinda-900 mb-2">Crear Cuenta Universitaria</h2>
          <p className="text-gray-600">Únete al Marketplace de la UPEM</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre completo */}
            <div>
              <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-guinda-600" />
                Nombre completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez García"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
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
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
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

            {/* Matrícula (opcional) */}
            <div>
              <Label htmlFor="matricula" className="flex items-center gap-2 mb-2">
                <IdCard className="w-4 h-4 text-guinda-600" />
                Número de matrícula{' '}
                <span className="text-gray-400">(opcional)</span>
              </Label>
              <Input
                id="matricula"
                type="text"
                placeholder="Ej: 202403001 o 20-UPVM-123456"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                La matrícula ayuda a verificar que eres estudiante de la UPEM
              </p>
            </div>

            {/* Términos y condiciones */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, acceptTerms: checked as boolean })
                }
                className={errors.acceptTerms ? 'border-red-500' : ''}
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                Acepto los{' '}
                <a href="#" className="text-guinda-700 hover:text-guinda-900">
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="text-guinda-700 hover:text-guinda-900">
                  política de privacidad
                </a>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-500 text-sm -mt-2">{errors.acceptTerms}</p>
            )}

            {/* Botón submit */}
            <Button
              type="submit"
              className="w-full bg-guinda-700 hover:bg-guinda-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
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

          {/* Link a login */}
          <p className="text-center text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-guinda-700 hover:text-guinda-900"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}