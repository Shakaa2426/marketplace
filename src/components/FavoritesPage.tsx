import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth, useFavorites } from '../utils/supabase/hooks';

interface FavoritesPageProps {
  onBack: () => void;
  onProductClick: (productId: string) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
}

export function FavoritesPage({ onBack, onProductClick, favorites: favIds, onToggleFavorite }: FavoritesPageProps) {
  const { user } = useAuth();
  const { favorites, loading } = useFavorites(user?.id);

  const favoriteProducts = favorites.map(f => f.products).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="mb-8">
          <h1 className="text-guinda-900 mb-2">Mis Favoritos</h1>
          <p className="text-gray-600">{favoriteProducts.length} productos guardados</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-guinda-700 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando favoritos...</p>
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No tienes favoritos aún</h3>
            <p className="text-gray-600 mb-6">
              Guarda productos que te interesen para encontrarlos fácilmente después
            </p>
            <Button onClick={onBack} className="bg-guinda-700 hover:bg-guinda-800 text-white">
              Explorar productos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => product && (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
              >
                <div 
                  className="aspect-square bg-gray-200 relative overflow-hidden cursor-pointer"
                  onClick={() => onProductClick(product.id)}
                >
                  <ImageWithFallback
                    src={product.image_url || "https://images.unsplash.com/photo-1546868871-0b37af8e8b50?w=400&h=400&fit=crop"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(product.id);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-guinda-50 transition-colors shadow-lg"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>
                  <div className="absolute top-3 left-3 bg-verde-600 text-white text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 
                    className="mb-2 text-gray-900 line-clamp-2 cursor-pointer hover:text-guinda-700"
                    onClick={() => onProductClick(product.id)}
                  >
                    {product.title}
                  </h3>
                  <p className="text-verde-600 mb-3">${product.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-guinda-600 rounded-full flex items-center justify-center text-white text-xs">
                      {product.profiles?.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="truncate">{product.profiles?.full_name || 'Usuario'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
