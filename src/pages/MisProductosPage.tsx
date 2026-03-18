import { useState } from 'react';
import { Plus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface MisProductosPageProps {
  products: any[];
  onNavigate: (page: string) => void;
  onProductClick: (productId: string) => void;
  onToggleProductActivo?: (id: string, activo: boolean) => Promise<void>;
  onBack?: () => void;
}

export function MisProductosPage({ products, onNavigate, onProductClick, onToggleProductActivo, onBack }: MisProductosPageProps) {
  const [tab, setTab] = useState<'activos' | 'inactivos' | 'todos'>('activos');

  const productosFiltrados = products.filter(p => {
    if (tab === 'activos') return p.available;
    if (tab === 'inactivos') return !p.available;
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto py-6">
        {/* Botón Volver */}
        <button
          onClick={() => onBack ? onBack() : onNavigate('explore')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-neutral-900 mb-1">Mis Publicaciones</h1>
            <p className="text-neutral-600">
              Gestiona tus productos publicados
            </p>
          </div>
          <button
            onClick={() => onNavigate('nuevo-producto')}
            className="px-4 py-2 bg-verde-600 text-white rounded-lg hover:bg-verde-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Publicación
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-neutral-200">
          <button
            onClick={() => setTab('activos')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              tab === 'activos'
                ? 'border-guinda-700 text-guinda-700'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Activos ({products.filter(p => p.available).length})
          </button>
          <button
            onClick={() => setTab('inactivos')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              tab === 'inactivos'
                ? 'border-guinda-700 text-guinda-700'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Inactivos ({products.filter(p => !p.available).length})
          </button>
          <button
            onClick={() => setTab('todos')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              tab === 'todos'
                ? 'border-guinda-700 text-guinda-700'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Todos ({products.length})
          </button>
        </div>

        {/* Lista de productos */}
        {productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-neutral-900 mb-2">
              {tab === 'activos' ? 'No tienes publicaciones activas' : 
               tab === 'inactivos' ? 'No tienes publicaciones inactivas' : 
               'Aún no tienes publicaciones'}
            </h3>
            <p className="text-neutral-600 mb-4">
              Comienza publicando tu primer producto
            </p>
            <button
              onClick={() => onNavigate('nuevo-producto')}
              className="px-6 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors"
            >
              Publicar Producto
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {productosFiltrados.map(producto => (
              <div 
                key={producto.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
              >
                <div className="flex gap-4">
                  {/* Miniatura */}
                  <div 
                    onClick={() => onProductClick(producto.id)}
                    className="w-24 h-24 flex-shrink-0 bg-neutral-100 rounded overflow-hidden cursor-pointer"
                  >
                    {producto.image_url ? (
                      <ImageWithFallback
                        src={producto.image_url}
                        alt={producto.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 
                          onClick={() => onProductClick(producto.id)}
                          className="text-neutral-900 truncate cursor-pointer hover:text-guinda-700"
                        >
                          {producto.title}
                        </h3>
                        <p className="text-verde-600">
                          ${producto.price.toLocaleString('es-MX')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ml-2 flex-shrink-0 ${
                        producto.available 
                          ? 'bg-verde-100 text-verde-700' 
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {producto.available ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                      <span>👁️ {producto.views || 0} vistas</span>
                      <span className="px-2 py-1 bg-neutral-100 rounded text-xs">
                        {producto.category}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onProductClick(producto.id)}
                        className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-50 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                      {onToggleProductActivo && (
                        <button
                          onClick={async () => {
                            await onToggleProductActivo(producto.id, !producto.available);
                          }}
                          className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-50 transition-colors flex items-center gap-1"
                        >
                          {producto.available ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              Activar
                            </>
                          )}
                        </button>
                      )}
                    </div>
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