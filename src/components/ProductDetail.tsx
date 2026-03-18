import { useState, useEffect } from 'react';
import { Heart, Share2, MapPin, Calendar, Tag, ChevronLeft, ChevronRight, Star, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../utils/supabase/hooks';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onContactSeller: (sellerId: string, productId: string) => void;
  onProductClick: (productId: string) => void;
  onViewSellerProfile?: (sellerId: string) => void;
  onEditProduct?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  image_url: string;
  available: boolean;
  sale_status?: 'disponible' | 'en_proceso' | 'vendido';
  views: number;
  created_at: string;
  user_id: string;
  seller?: {
    full_name: string;
    avatar_url: string;
    created_at: string;
  };
}

export function ProductDetail({ productId, onBack, onContactSeller, onProductClick, onViewSellerProfile, onEditProduct, onDeleteProduct, isFavorite, onToggleFavorite }: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isMyProduct = user && product && product.user_id === user.id;

  useEffect(() => {
    // Validar que productId sea un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!productId || !uuidRegex.test(productId)) {
      console.error('Invalid product ID:', productId);
      toast.error('ID de producto inválido');
      setLoading(false);
      return;
    }
    
    loadProduct();
    incrementViews();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      // Fetch product with seller info
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles(full_name, avatar_url, created_at)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error loading product:', error);
        toast.error('Error al cargar el producto');
        return;
      }

      setProduct(data);

      // Fetch similar products (same category, different product)
      if (data.category) {
        const { data: similar } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .eq('available', true)
          .neq('id', productId)
          .limit(3);

        if (similar) {
          setSimilarProducts(similar);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_product_views', { product_uuid: productId });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleUpdateSaleStatus = async (newStatus: 'disponible' | 'en_proceso' | 'vendido') => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          sale_status: newStatus,
          available: newStatus === 'disponible' 
        })
        .eq('id', productId);

      if (error) throw error;

      // Actualizar el estado local
      setProduct(prev => prev ? { ...prev, sale_status: newStatus, available: newStatus === 'disponible' } : null);
      
      toast.success(`Producto marcado como ${newStatus === 'disponible' ? 'disponible' : newStatus === 'en_proceso' ? 'en proceso' : 'vendido'}`);
    } catch (error) {
      console.error('Error updating sale status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  const getMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.title,
          text: `Mira este producto: ${product?.title}`,
          url: window.location.href,
        });
        toast.success('¡Compartido exitosamente!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
      }
    } catch (error: any) {
      // El usuario canceló el share o no tiene permisos
      if (error.name === 'AbortError') {
        // Usuario canceló, no hacer nada
        return;
      }
      
      if (error.name === 'NotAllowedError') {
        // Sin permisos, usar fallback silenciosamente
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Enlace copiado al portapapeles');
        } catch (clipboardError) {
          toast.error('No se pudo compartir el producto');
        }
        return;
      }
      
      console.error('Error sharing:', error);
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
      } catch (clipboardError) {
        toast.error('No se pudo compartir el producto');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guinda-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Producto no encontrado</p>
          <Button onClick={onBack} variant="outline">
            Volver a explorar
          </Button>
        </div>
      </div>
    );
  }

  const images = product.image_url 
    ? [product.image_url]
    : ['https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&h=800&fit=crop'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón volver */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Volver a explorar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de imágenes */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 mb-4">
              <div className="relative aspect-square bg-gray-200">
                <ImageWithFallback
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={onToggleFavorite}
                  className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-guinda-50 transition-colors shadow-lg"
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-guinda-700'}`} />
                </button>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                {/* Indicadores */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition ${
                          index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex ? 'border-guinda-600' : 'border-gray-200'
                    }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-verde-100 text-verde-700 text-sm px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                  {product.condition}
                </span>
                <span className={`${product.available ? 'bg-verde-100 text-verde-700' : 'bg-gray-100 text-gray-700'} text-sm px-3 py-1 rounded-full`}>
                  {product.available ? '✓ Disponible' : 'No disponible'}
                </span>
              </div>

              {/* Título y precio */}
              <h1 className="text-guinda-900 mb-4">{product.title}</h1>
              <p className="text-verde-600 mb-6">${product.price.toLocaleString()}</p>

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-guinda-900 mb-3">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{product.description || 'Sin descripción'}</p>
              </div>

              {/* Detalles */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {product.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-guinda-600" />
                    <span>{product.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-guinda-600" />
                  <span>Publicado {getTimeAgo(product.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Tag className="w-5 h-5 text-guinda-600" />
                  <span>{product.views} personas lo han visto</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="space-y-3">
                {!isMyProduct ? (
                  <Button 
                    className="w-full bg-guinda-700 hover:bg-guinda-800 text-white"
                    size="lg"
                    onClick={() => onContactSeller(product.user_id, product.id)}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contactar Vendedor
                  </Button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="bg-verde-600 hover:bg-verde-700 text-white"
                        size="lg"
                        onClick={() => onEditProduct?.(product.id)}
                      >
                        <Edit className="w-5 h-5 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline"
                        size="lg"
                        onClick={() => onDeleteProduct?.(product.id)}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                    
                    {/* Estado de venta */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Estado de venta:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={product.sale_status === 'disponible' || !product.sale_status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleUpdateSaleStatus('disponible')}
                          className={product.sale_status === 'disponible' || !product.sale_status ? 'bg-verde-600 hover:bg-verde-700' : ''}
                        >
                          Disponible
                        </Button>
                        <Button
                          variant={product.sale_status === 'en_proceso' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleUpdateSaleStatus('en_proceso')}
                          className={product.sale_status === 'en_proceso' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                        >
                          En proceso
                        </Button>
                        <Button
                          variant={product.sale_status === 'vendido' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleUpdateSaleStatus('vendido')}
                          className={product.sale_status === 'vendido' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                        >
                          Vendido
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onToggleFavorite}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    Favorito
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-5 h-5 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>
            </div>

            {/* Información del vendedor */}
            {product.seller && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-guinda-900 mb-4">Vendedor</h3>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-guinda-600 rounded-full flex items-center justify-center text-white text-xl">
                    {product.seller.avatar_url ? (
                      <ImageWithFallback
                        src={product.seller.avatar_url}
                        alt={product.seller.full_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      product.seller.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-1">{product.seller.full_name}</h4>
                    <p className="text-sm text-gray-500">
                      Miembro desde {getMemberSince(product.seller.created_at)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => onViewSellerProfile?.(product.user_id)}>
                  Ver perfil del vendedor
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Productos similares */}
        {similarProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-guinda-900 mb-6">Productos Similares</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProducts.map((similar) => (
                <div
                  key={similar.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => onProductClick(similar.id)}
                >
                  <div className="aspect-square bg-gray-200">
                    <ImageWithFallback
                      src={similar.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop'}
                      alt={similar.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-gray-900 mb-2 line-clamp-2">{similar.title}</h4>
                    <p className="text-verde-600">${similar.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}