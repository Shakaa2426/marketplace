import { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Filter, X, ChevronDown } from 'lucide-react';

interface ExplorarPageProps {
  productos: any[];
  onNavigate: (page: string, data?: any) => void;
  filtroInicial?: { categoria?: string };
}

export function ExplorarPage({ productos, onNavigate, filtroInicial }: ExplorarPageProps) {
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: filtroInicial?.categoria || 'todas',
    precioMin: '',
    precioMax: '',
    condicion: '',
    ordenar: 'reciente'
  });

  const categorias = ['todas', 'Libros', 'Electrónicos', 'Ropa', 'Apuntes', 'Otros'];
  const ordenamientos = [
    { value: 'reciente', label: 'Más recientes' },
    { value: 'precio-asc', label: 'Precio: menor a mayor' },
    { value: 'precio-desc', label: 'Precio: mayor a menor' }
  ];

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    if (filtros.categoria !== 'todas' && producto.categoria !== filtros.categoria) return false;
    if (filtros.busqueda && !producto.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) && !producto.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())) return false;
    if (filtros.precioMin && producto.precio < parseFloat(filtros.precioMin)) return false;
    if (filtros.precioMax && producto.precio > parseFloat(filtros.precioMax)) return false;
    if (filtros.condicion && producto.condicion !== filtros.condicion) return false;
    return true;
  });

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (filtros.ordenar === 'precio-asc') return a.precio - b.precio;
    if (filtros.ordenar === 'precio-desc') return b.precio - a.precio;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-neutral-900 mb-1">Explorar Publicaciones</h1>
            <p className="text-neutral-600">
              {productosOrdenados.length} publicación{productosOrdenados.length !== 1 ? 'es' : ''} encontrada{productosOrdenados.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Ordenamiento */}
            <select
              value={filtros.ordenar}
              onChange={(e) => setFiltros({ ...filtros, ordenar: e.target.value })}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent bg-white"
            >
              {ordenamientos.map(ord => (
                <option key={ord.value} value={ord.value}>{ord.label}</option>
              ))}
            </select>

            {/* Toggle filtros móvil */}
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="lg:hidden px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar de filtros */}
          <aside className={`
            ${showFiltros ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'}
            lg:block lg:static lg:w-64 flex-shrink-0
          `}>
            {/* Header móvil */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              <h2 className="text-neutral-900">Filtros</h2>
              <button
                onClick={() => setShowFiltros(false)}
                className="p-2 hover:bg-neutral-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm mb-2 text-neutral-700">Buscar</label>
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  placeholder="Buscar productos..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                />
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm mb-3 text-neutral-700">Categoría</label>
                <div className="space-y-2">
                  {categorias.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="categoria"
                        value={cat}
                        checked={filtros.categoria === cat}
                        onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                        className="w-4 h-4 text-guinda-700 border-neutral-300 focus:ring-guinda-700"
                      />
                      <span className="text-sm text-neutral-700 capitalize">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm mb-3 text-neutral-700">Rango de precio</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filtros.precioMin}
                    onChange={(e) => setFiltros({ ...filtros, precioMin: e.target.value })}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filtros.precioMax}
                    onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Condición */}
              <div>
                <label className="block text-sm mb-3 text-neutral-700">Condición</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condicion"
                      value=""
                      checked={filtros.condicion === ''}
                      onChange={() => setFiltros({ ...filtros, condicion: '' })}
                      className="w-4 h-4 text-guinda-700 border-neutral-300 focus:ring-guinda-700"
                    />
                    <span className="text-sm text-neutral-700">Todas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condicion"
                      value="nuevo"
                      checked={filtros.condicion === 'nuevo'}
                      onChange={() => setFiltros({ ...filtros, condicion: 'nuevo' })}
                      className="w-4 h-4 text-guinda-700 border-neutral-300 focus:ring-guinda-700"
                    />
                    <span className="text-sm text-neutral-700">Nuevo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condicion"
                      value="usado"
                      checked={filtros.condicion === 'usado'}
                      onChange={() => setFiltros({ ...filtros, condicion: 'usado' })}
                      className="w-4 h-4 text-guinda-700 border-neutral-300 focus:ring-guinda-700"
                    />
                    <span className="text-sm text-neutral-700">Usado</span>
                  </label>
                </div>
              </div>

              {/* Botón aplicar filtros móvil */}
              <button
                onClick={() => setShowFiltros(false)}
                className="lg:hidden w-full px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800"
              >
                Aplicar Filtros
              </button>
            </div>
          </aside>

          {/* Listado de productos */}
          <main className="flex-1">
            {productosOrdenados.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-neutral-900 mb-2">No se encontraron productos</h3>
                <p className="text-neutral-600 mb-4">
                  Intenta ajustar tus filtros de búsqueda
                </p>
                <button
                  onClick={() => setFiltros({
                    busqueda: '',
                    categoria: 'todas',
                    precioMin: '',
                    precioMax: '',
                    condicion: '',
                    ordenar: 'reciente'
                  })}
                  className="px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosOrdenados.map(producto => (
                  <ProductCard
                    key={producto.id}
                    {...producto}
                    onClick={() => onNavigate('producto', { id: producto.id })}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
