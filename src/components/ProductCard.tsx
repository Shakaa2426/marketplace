import { Heart, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  id: string;
  titulo: string;
  precio: number;
  imagenes: string[];
  vendedor?: string;
  ubicacion?: string;
  categoria?: string;
  onClick?: () => void;
}

export function ProductCard({ 
  titulo, 
  precio, 
  imagenes, 
  vendedor, 
  ubicacion, 
  categoria,
  onClick 
}: ProductCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
    >
      <div className="relative aspect-square bg-neutral-100">
        {imagenes && imagenes.length > 0 ? (
          <ImageWithFallback
            src={imagenes[0]}
            alt={titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg
              width="48"
              height="48"
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
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-50"
        >
          <Heart className="w-4 h-4 text-guinda-700" />
        </button>
        {categoria && (
          <span className="absolute bottom-2 left-2 bg-guinda-700 text-white text-xs px-2 py-1 rounded">
            {categoria}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="truncate text-neutral-900 mb-1">{titulo}</h3>
        <p className="text-verde-600 mb-2">${precio.toLocaleString('es-MX')}</p>
        
        {vendedor && (
          <p className="text-sm text-neutral-500 truncate mb-1">Por {vendedor}</p>
        )}
        
        {ubicacion && (
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="w-3 h-3" />
            <span>{ubicacion}</span>
          </div>
        )}
      </div>
    </div>
  );
}
