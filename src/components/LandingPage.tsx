import { Search, ShoppingBag, MessageCircle, CheckCircle, Book, Laptop, Shirt, FileText, Package } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { useProducts } from '../utils/supabase/hooks';

interface LandingPageProps {
  onExploreClick: () => void;
  onSellClick: () => void;
  onCategoryClick: (category: string) => void;
  onProductClick: (productId: string) => void;
  onSearch: (query: string) => void;
  onViewAllClick: () => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

export function LandingPage({ 
  onExploreClick, 
  onSellClick, 
  onCategoryClick, 
  onProductClick,
  onSearch,
  onViewAllClick,
  isLoggedIn = false,
  onLoginClick
}: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { products, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts({ limit: 6 });
  }, []);

  const allSearchTerms = [
    'Cálculo',
    'Calculadora',
    'Laptop',
    'iPhone',
    'Apuntes',
    'Termodinámica',
    'Física',
    'Química',
    'Chamarra',
    'Mochila',
    'Libros',
    'Electrónicos'
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const filtered = allSearchTerms.filter(term => 
        term.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const categories = [
    { name: 'Libros', icon: Book, color: 'bg-blue-100 text-blue-600' },
    { name: 'Electrónicos', icon: Laptop, color: 'bg-purple-100 text-purple-600' },
    { name: 'Ropa', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
    { name: 'Apuntes', icon: FileText, color: 'bg-verde-100 text-verde-600' },
    { name: 'Otros', icon: Package, color: 'bg-amber-100 text-amber-600' },
  ];

  const steps = [
    {
      title: 'Publica',
      description: 'Sube fotos y describe tu producto en minutos',
      icon: ShoppingBag
    },
    {
      title: 'Conecta',
      description: 'Chatea directamente con compradores interesados',
      icon: MessageCircle
    },
    {
      title: 'Vende',
      description: 'Realiza la transacción de forma segura en el campus',
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-guinda-700 via-guinda-800 to-guinda-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center max-w-3xl mx-auto text-center">
            <h1 className="mb-6">
              Compra y vende dentro de tu comunidad universitaria
            </h1>
            <p className="text-xl text-guinda-100 mb-8">
              Libros, apuntes, electrónicos, y más entre estudiantes de la UPVM
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-verde-600 hover:bg-verde-700 text-white"
                onClick={() => {
                  if (isLoggedIn) {
                    onExploreClick();
                  } else {
                    onLoginClick?.();
                  }
                }}
              >
                <Search className="w-5 h-5 mr-2" />
                Explorar Publicaciones
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white text-guinda-900 hover:bg-gray-100 border-0"
                onClick={onSellClick}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Vender algo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías destacadas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-guinda-900 mb-12">Categorías Destacadas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  if (isLoggedIn) {
                    onCategoryClick(category.name);
                  } else {
                    onLoginClick?.();
                  }
                }}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-guinda-500 hover:shadow-lg transition-all group"
              >
                <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-8 h-8" />
                </div>
                <span className="text-gray-900">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Publicaciones recientes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-guinda-900">Publicaciones Recientes</h2>
            <Button 
              variant="ghost" 
              className="text-guinda-700 hover:text-guinda-900"
              onClick={() => {
                if (isLoggedIn) {
                  onViewAllClick();
                } else {
                  onLoginClick?.();
                }
              }}
            >
              Ver todas →
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => onProductClick(product.id)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <ImageWithFallback
                    src={product.image_url || 'https://images.unsplash.com/photo-1546868871-0b37af8e8b50?w=400&h=400&fit=crop'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-verde-600 text-white text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 text-gray-900 line-clamp-2">{product.title}</h3>
                  <p className="text-verde-600 mb-3">${product.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-guinda-600 rounded-full flex items-center justify-center text-white text-xs">
                      {product.profiles?.full_name?.charAt(0) || 'U'}
                    </div>
                    <span>{product.profiles?.full_name || 'Usuario'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-guinda-900 mb-4">¿Cómo Funciona?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Vender y comprar en nuestra comunidad universitaria es fácil y seguro
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-guinda-600 to-guinda-800 rounded-full flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-verde-600 rounded-full flex items-center justify-center text-white">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-guinda-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-guinda-700 to-guinda-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="mb-4 text-center" style={{ textAlign: 'center' }}>¿Listo para comenzar?</h2>
          <p className="text-xl text-guinda-100 mb-8 text-center" style={{ textAlign: 'center' }}>
            Únete a cientos de estudiantes que ya compran y venden en nuestra comunidad
          </p>
          <Button 
            size="lg" 
            className="bg-verde-600 hover:bg-verde-700 text-white"
            onClick={onSellClick}
          >
            Crear cuenta gratis
          </Button>
        </div>
      </section>
    </div>
  );
}