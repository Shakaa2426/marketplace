import { useState } from 'react';
import { Heart, MapPin, Calendar, Tag, MessageCircle, Share2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ProductoDetallePageProps {
  producto: any;
  vendedor: any;
  user: any;
  onNavigate: (page: string, data?: any) => void;
  onContactar: (vendedorId: string) => void;
  onCrearPedido: (productoId: string) => void;
}

export function ProductoDetallePage({ 
  producto, 
  vendedor, 
  user, 
  onNavigate, 
  onContactar,
  onCrearPedido 
}: ProductoDetallePageProps) {
  const [imagenActual, setImagenActual] = useState(0);

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-neutral-900 mb-2">Producto no encontrado</h2>
          <button
            onClick={() => onNavigate('explorar')}
            className="text-guinda-700 hover:text-guinda-800"
          >
            ← Volver a explorar
          </button>
        </div>
      </div>
    );
  }

  const imagenes = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : [];
  const tieneImagenes = imagenes.length > 0;

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto py-6">
        {/* Breadcrumb */}
        <button
          onClick={() => onNavigate('explorar')}
          className="flex items-center gap-2 text-neutral-600 hover:text-guinda-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a explorar
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <div className="relative aspect-square bg-neutral-100">
                {tieneImagenes ? (
                  <>
                    <ImageWithFallback
                      src={imagenes[imagenActual]}
                      alt={producto.titulo}
                      className="w-full h-full object-cover"
                    />
                    {imagenes.length > 1 && (
                      <>
                        <button
                          onClick={() => setImagenActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setImagenActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <svg
                      width="96"
                      height="96"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Miniaturas */}
              {imagenes.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {imagenes.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setImagenActual(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                        imagenActual === idx ? 'border-guinda-700' : 'border-neutral-200'
                      }`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`${producto.titulo} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-neutral-900 mb-2">{producto.titulo}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      producto.condicion === 'nuevo' 
                        ? 'bg-verde-100 text-verde-700' 
                        : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {producto.condicion === 'nuevo' ? 'Nuevo' : 'Usado'}
                    </span>
                    <span className="px-3 py-1 bg-guinda-100 text-guinda-700 rounded-full text-sm">
                      {producto.categoria}
                    </span>
                    {producto.activo && (
                      <span className="px-3 py-1 bg-verde-100 text-verde-700 rounded-full text-sm">
                        Disponible
                      </span>
                    )}
                  </div>
                </div>
                <button className="p-2 hover:bg-neutral-100 rounded-full">
                  <Heart className="w-6 h-6 text-guinda-700" />
                </button>
              </div>

              <div className="text-4xl text-verde-600 mb-6">
                ${producto.precio.toLocaleString('es-MX')}
              </div>

              {/* Información adicional */}
              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{producto.ubicacion || 'Campus UPEM'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Publicado el {formatearFecha(producto.createdAt)}</span>
                </div>
                {producto.vistas > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{producto.vistas} visualizaciones</span>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-neutral-900 mb-3">Descripción</h3>
              <p className="text-neutral-700 whitespace-pre-wrap">{producto.descripcion}</p>
            </div>

            {/* Vendedor */}
            {vendedor && (
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-neutral-900 mb-4">Vendedor</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-guinda-700 text-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-neutral-900">{vendedor.nombre}</h4>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <span>⭐ {vendedor.rating || 0}</span>
                      <span>•</span>
                      <span>{vendedor.totalVentas || 0} ventas</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  Miembro desde {new Date(vendedor.createdAt).getFullYear()}
                </p>
                <button
                  onClick={() => onNavigate('perfil', { userId: vendedor.id })}
                  className="text-guinda-700 hover:text-guinda-800 text-sm"
                >
                  Ver perfil completo →
                </button>
              </div>
            )}

            {/* Acciones */}
            {user && user.id !== producto.vendedorId && (
              <div className="bg-white rounded-lg p-6 shadow space-y-3">
                <button
                  onClick={() => onContactar(producto.vendedorId)}
                  className="w-full px-6 py-3 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contactar Vendedor
                </button>
                <button
                  onClick={() => onCrearPedido(producto.id)}
                  className="w-full px-6 py-3 bg-verde-600 text-white rounded-lg hover:bg-verde-700 transition-colors"
                >
                  Hacer Pedido
                </button>
                <button className="w-full px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Compartir
                </button>
              </div>
            )}

            {!user && (
              <div className="bg-white rounded-lg p-6 shadow text-center">
                <p className="text-neutral-600 mb-4">
                  Inicia sesión para contactar al vendedor
                </p>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
