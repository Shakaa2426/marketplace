import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Package } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../utils/supabase/client';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface SellerProfilePageProps {
  sellerId: string;
  onBack: () => void;
  onProductClick: (productId: string) => void;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  condition: string;
  image_url?: string;
  available: boolean;
  created_at: string;
}

export function SellerProfilePage({ sellerId, onBack, onProductClick }: SellerProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellerData();
  }, [sellerId]);

  const loadSellerData = async () => {
    try {
      setLoading(true);

      // Cargar perfil del vendedor
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sellerId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Cargar productos del vendedor
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', sellerId)
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error: any) {
      console.error('Error loading seller data:', error);
      toast.error('Error al cargar el perfil del vendedor');
    } finally {
      setLoading(false);
    }
  };

  const getMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return `Hace ${Math.floor(days / 7)} semanas`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guinda-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Perfil no encontrado</p>
          <Button onClick={onBack} variant="outline">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de regreso */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Perfil del vendedor */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-guinda-600 flex items-center justify-center text-white text-3xl overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <ImageWithFallback
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.full_name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Información */}
            <div className="flex-1">
              <h1 className="text-guinda-900 mb-2">{profile.full_name}</h1>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-guinda-600" />
                  <span>Miembro desde {getMemberSince(profile.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-guinda-600" />
                  <span>{products.length} {products.length === 1 ? 'producto' : 'productos'} en venta</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos del vendedor */}
        <div className="mb-8">
          <h2 className="text-guinda-900 mb-6">Productos de {profile.full_name}</h2>
          
          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Este vendedor no tiene productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                  onClick={() => onProductClick(product.id)}
                >
                  <div className="aspect-square bg-gray-200 relative overflow-hidden">
                    <ImageWithFallback
                      src={product.image_url || 'https://images.unsplash.com/photo-1546868871-0b37af8e8b50?w=400&h=400&fit=crop'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                      <span className="bg-verde-600 text-white text-xs px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {product.condition}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-gray-900 line-clamp-2 min-h-[3rem]">
                      {product.title}
                    </h3>
                    <p className="text-verde-600 mb-3">${product.price.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">{getTimeAgo(product.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
