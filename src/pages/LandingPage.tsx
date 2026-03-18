import { BookOpen, Laptop, ShoppingBag, FileText, Package, ArrowRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

interface LandingPageProps {
  onNavigate: (page: string, data?: any) => void;
  productosRecientes?: any[];
}

export function LandingPage({ onNavigate, productosRecientes = [] }: LandingPageProps) {
  const categorias = [
    { nombre: 'Libros', icon: BookOpen, color: 'bg-guinda-100 text-guinda-700' },
    { nombre: 'Electrónicos', icon: Laptop, color: 'bg-verde-100 text-verde-700' },
    { nombre: 'Ropa', icon: ShoppingBag, color: 'bg-info-100 text-info-700' },
    { nombre: 'Apuntes', icon: FileText, color: 'bg-warning-100 text-warning-700' },
    { nombre: 'Otros', icon: Package, color: 'bg-neutral-200 text-neutral-700' },
  ];

  const pasos = [
    {
      numero: '1',
      titulo: 'Publica tu producto',
      descripcion: 'Sube fotos, agrega una descripción y establece tu precio'
    },
    {
      numero: '2',
      titulo: 'Conecta con compradores',
      descripcion: 'Chatea directamente con estudiantes interesados'
    },
    {
      numero: '3',
      titulo: 'Completa la venta',
      descripcion: 'Acuerden el encuentro y finalicen la transacción de forma segura'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-guinda-700 to-guinda-900 text-white py-16 md:py-24">
        <div className="container mx-auto text-center">
          <h1 className="mb-4 text-white">
            Compra y vende dentro de tu comunidad universitaria
          </h1>
          <p className="text-lg md:text-xl mb-8 text-guinda-100 max-w-2xl mx-auto">
            Libros, apuntes, electrónicos, y más entre estudiantes de la UPEM
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('explorar')}
              className="px-8 py-3 bg-white text-guinda-700 rounded-lg hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
            >
              Explorar Publicaciones
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('registro')}
              className="px-8 py-3 bg-verde-600 text-white rounded-lg hover:bg-verde-700 transition-colors"
            >
              Vender algo
            </button>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 bg-white">
        <div className="container mx-auto">
          <h2 className="text-center mb-8 text-neutral-900">Explora por categoría</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categorias.map((cat) => (
              <button
                key={cat.nombre}
                onClick={() => onNavigate('explorar', { categoria: cat.nombre })}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-neutral-200 hover:border-guinda-700 hover:shadow-md transition-all group"
              >
                <div className={`${cat.color} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-neutral-700 group-hover:text-guinda-700 transition-colors">
                  {cat.nombre}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Productos recientes */}
      {productosRecientes.length > 0 && (
        <section className="py-12 bg-neutral-50">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-neutral-900">Publicaciones recientes</h2>
              <button
                onClick={() => onNavigate('explorar')}
                className="text-guinda-700 hover:text-guinda-800 flex items-center gap-2"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productosRecientes.slice(0, 8).map((producto) => (
                <ProductCard
                  key={producto.id}
                  {...producto}
                  onClick={() => onNavigate('producto', { id: producto.id })}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <h2 className="text-center mb-12 text-neutral-900">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pasos.map((paso) => (
              <div key={paso.numero} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-guinda-700 to-guinda-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  {paso.numero}
                </div>
                <h3 className="mb-2 text-neutral-900">{paso.titulo}</h3>
                <p className="text-neutral-600">{paso.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-br from-verde-600 to-verde-700 text-white">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-white">¿Listo para comenzar?</h2>
          <p className="text-lg mb-8 text-verde-100 max-w-2xl mx-auto">
            Únete a cientos de estudiantes que ya están comprando y vendiendo en nuestra plataforma
          </p>
          <button
            onClick={() => onNavigate('registro')}
            className="px-8 py-3 bg-white text-verde-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Crear mi cuenta gratis
          </button>
        </div>
      </section>
    </div>
  );
}
