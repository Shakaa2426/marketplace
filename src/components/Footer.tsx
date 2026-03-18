import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-guinda-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Información Universidad */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-verde-400 mb-4">Universidad Politécnica del Estado de México</h3>
            <p className="text-gray-300 text-sm mb-4">
              Marketplace oficial para la comunidad estudiantil. Compra y vende de manera segura dentro del campus.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-verde-400" />
                <span>Av. Politécnico S/N, Col. Ejido de Tecámac</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-verde-400" />
                <span>55 5000 0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-verde-400" />
                <span>contacto@upemex.edu.mx</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-verde-400 transition">Inicio</a></li>
              <li><a href="#" className="hover:text-verde-400 transition">Explorar</a></li>
              <li><a href="#" className="hover:text-verde-400 transition">Cómo funciona</a></li>
              <li><a href="#" className="hover:text-verde-400 transition">Ayuda</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-verde-400 transition">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-verde-400 transition">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-verde-400 transition">Reglas de la comunidad</a></li>
              <li><a href="#" className="hover:text-verde-400 transition">Contacto</a></li>
            </ul>
          </div>
        </div>

        {/* Redes sociales y copyright */}
        <div className="border-t border-guinda-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © 2025 Universidad Politécnica del Estado de México. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 bg-guinda-800 rounded-full flex items-center justify-center hover:bg-verde-600 transition">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 bg-guinda-800 rounded-full flex items-center justify-center hover:bg-verde-600 transition">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 bg-guinda-800 rounded-full flex items-center justify-center hover:bg-verde-600 transition">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
