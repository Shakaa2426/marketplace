import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Heart, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useProducts, type Product } from '../utils/supabase/hooks';

interface ExplorePageProps {
  onProductClick: (productId: string) => void;
  onBack: () => void;
  searchQuery?: string;
  selectedCategory?: string | null;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  onClearSearch?: () => void; // Nueva prop para limpiar búsqueda en App.tsx
}

export function ExplorePage({ 
  onProductClick, 
  onBack, 
  searchQuery = '', 
  selectedCategory = null,
  favorites,
  onToggleFavorite,
  onClearSearch
}: ExplorePageProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(selectedCategory ? [selectedCategory] : []);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const categories = ['Libros', 'Electrónicos', 'Ropa', 'Muebles', 'Apuntes', 'Otros'];
  const conditions = ['Nuevo', 'Usado'];
  
  const { products: allProducts, loading, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Actualizar searchInput cuando cambia searchQuery prop
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Actualizar selectedCategories cuando cambia selectedCategory prop
  useEffect(() => {
    if (selectedCategory) {
      setSelectedCategories([selectedCategory]);
    }
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filtrar por búsqueda (usar searchInput local, no el prop)
    if (searchInput.trim()) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.category.toLowerCase().includes(searchInput.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchInput.toLowerCase()))
      );
    }

    // Filtrar por categorías
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Filtrar por condición
    if (condition.length > 0) {
      filtered = filtered.filter(p => condition.includes(p.condition));
    }

    // Filtrar por precio
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(maxPrice));
    }

    // Ordenar
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [allProducts, searchInput, selectedCategories, condition, minPrice, maxPrice, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const toggleCondition = (cond: string) => {
    setCondition(prev => 
      prev.includes(cond)
        ? prev.filter(c => c !== cond)
        : [...prev, cond]
    );
    setCurrentPage(1);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de regreso */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Header de página */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-guinda-900 mb-2">Explorar Publicaciones</h1>
              <p className="text-gray-600">{filteredProducts.length} publicaciones encontradas</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
              >
                <option value="recent">Más recientes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar de filtros */}
          <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-guinda-900 mb-4">Filtros</h3>

              {/* Búsqueda */}
              <div className="mb-6">
                <Label className="mb-2">Búsqueda</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Buscar..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categorías */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <Label>Categorías</Label>
                  <button
                    onClick={() => {
                      if (selectedCategories.length === categories.length) {
                        setSelectedCategories([]);
                      } else {
                        setSelectedCategories(categories);
                      }
                      setCurrentPage(1);
                    }}
                    className="text-xs text-guinda-700 hover:text-guinda-900 hover:underline"
                  >
                    {selectedCategories.length === categories.length ? 'Desmarcar todo' : 'Marcar todo'}
                  </button>
                </div>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={category} className="cursor-pointer text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rango de precio */}
              <div className="mb-6">
                <Label className="mb-3">Rango de precio</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Condición */}
              <div className="mb-6">
                <Label className="mb-3">Condición</Label>
                <div className="space-y-2">
                  {conditions.map((cond) => (
                    <div key={cond} className="flex items-center gap-2">
                      <Checkbox
                        id={cond}
                        checked={condition.includes(cond)}
                        onCheckedChange={() => toggleCondition(cond)}
                      />
                      <Label htmlFor={cond} className="cursor-pointer text-sm">
                        {cond}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-guinda-700 hover:bg-guinda-800 text-white"
                onClick={() => setCurrentPage(1)}
              >
                Aplicar Filtros
              </Button>
            </div>
          </aside>

          {/* Grid de productos */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-guinda-700 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Cargando productos...</p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600">
                  Intenta ajustar los filtros o la búsqueda
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group ${
                        !product.available ? 'opacity-60' : ''
                      }`}
                    >
                      <div 
                        className="aspect-square bg-gray-200 relative overflow-hidden cursor-pointer"
                        onClick={() => onProductClick(product.id)}
                      >
                        <ImageWithFallback
                          src={product.image_url || 'https://images.unsplash.com/photo-1546868871-0b37af8e8b50?w=400&h=400&fit=crop'}
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
                          <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-guinda-700'}`} />
                        </button>
                        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                          <span className="bg-verde-600 text-white text-xs px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                          <span className={`${product.available ? 'bg-verde-600' : 'bg-gray-600'} text-white text-xs px-2 py-1 rounded-full`}>
                            {product.available ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 
                          className="mb-2 text-gray-900 line-clamp-2 min-h-[3rem] cursor-pointer hover:text-guinda-700"
                          onClick={() => onProductClick(product.id)}
                        >
                          {product.title}
                        </h3>
                        <p className="text-verde-600 mb-3">${product.price.toLocaleString()}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-6 h-6 bg-guinda-600 rounded-full flex items-center justify-center text-white text-xs">
                              {product.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                            <span className="truncate">{product.profiles?.full_name || 'Usuario'}</span>
                          </div>
                          <span className="text-gray-400 text-xs">{getTimeAgo(product.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <Button 
                        key={i + 1}
                        size="sm" 
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? 'bg-guinda-700 text-white' : ''}
                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}