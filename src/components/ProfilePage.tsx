import { ArrowLeft, User, Mail, IdCard, Package, Edit, Upload, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../utils/supabase/hooks';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateToProducts?: () => void;
}

export function ProfilePage({ onBack, onLogout, onNavigateToProducts }: ProfilePageProps) {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [activeProducts, setActiveProducts] = useState(0);
  const [soldProducts, setSoldProducts] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setMatricula(profile.matricula || '');
      loadUserStats();
    }
  }, [profile]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // Count active products
      const { count: activeCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('available', true);

      // Count sold products (products that are no longer available)
      const { count: soldCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('available', false);

      setActiveProducts(activeCount || 0);
      setSoldProducts(soldCount || 0);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        full_name: fullName,
        matricula: matricula || null,
      });
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Error al cerrar sesión');
      } else {
        toast.success('Sesión cerrada correctamente');
        // Redirigir a la landing page después de cerrar sesión
        setTimeout(() => {
          onLogout();
        }, 500);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('El archivo debe ser una imagen');
        return;
      }

      setUploading(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: data.publicUrl });
      
      toast.success('Avatar actualizado correctamente');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir el avatar');
    } finally {
      setUploading(false);
    }
  };

  const getMemberSince = () => {
    if (!profile?.created_at) return 'Fecha desconocida';
    const date = new Date(profile.created_at);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guinda-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Header de perfil */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-verde-600 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <ImageWithFallback
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-guinda-700 rounded-full flex items-center justify-center text-white hover:bg-guinda-800 cursor-pointer">
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-3 mb-3">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                  <Input
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Matrícula (opcional)"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-guinda-900 mb-2">{profile.full_name}</h1>
                  <p className="text-gray-600 mb-3">{profile.email}</p>
                </>
              )}
              <span className="inline-block bg-verde-100 text-verde-700 text-sm px-3 py-1 rounded-full">
                Miembro desde {getMemberSince()}
              </span>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(profile.full_name || '');
                    setMatricula(profile.matricula || '');
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-guinda-700 hover:bg-guinda-800 text-white"
                  onClick={handleSaveProfile}
                >
                  Guardar
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-guinda-700 hover:bg-guinda-800 text-white"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <button
            onClick={onNavigateToProducts}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:border-guinda-500 hover:shadow-md transition-all"
          >
            <Package className="w-8 h-8 text-guinda-700 mx-auto mb-2" />
            <p className="text-gray-600 mb-1">Publicaciones Activas</p>
            <p className="text-guinda-900">{activeProducts}</p>
            {onNavigateToProducts && (
              <p className="text-sm text-guinda-600 mt-2">Ver mis publicaciones →</p>
            )}
          </button>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Package className="w-8 h-8 text-verde-600 mx-auto mb-2" />
            <p className="text-gray-600 mb-1">Productos Vendidos</p>
            <p className="text-guinda-900">{soldProducts}</p>
          </div>
        </div>

        {/* Información personal */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-guinda-900 mb-6">Información Personal</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-guinda-600" />
              <div>
                <p className="text-sm text-gray-500">Nombre completo</p>
                <p className="text-gray-900">{profile.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-guinda-600" />
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="text-gray-900">{profile.email}</p>
              </div>
            </div>
            {profile.matricula && (
              <div className="flex items-center gap-3">
                <IdCard className="w-5 h-5 text-guinda-600" />
                <div>
                  <p className="text-sm text-gray-500">Matrícula</p>
                  <p className="text-gray-900">{profile.matricula}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de cierre de sesión */}
        <div className="mt-6">
          <Button 
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}