import { Search, Bell, MessageSquare, ShoppingBag, User, Menu, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
  showSearchBar?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onMessagesClick?: () => void;
  onFavoritesClick?: () => void;
  onPublishClick?: () => void;
  onHomeClick?: () => void;
  onSearch?: (query: string) => void;
  unreadMessages?: number;
  unreadNotifications?: number;
}

export function Header({ 
  isLoggedIn = false,
  userName,
  userAvatar,
  showSearchBar = true,
  onLoginClick,
  onRegisterClick,
  onProfileClick,
  onNotificationsClick,
  onMessagesClick,
  onFavoritesClick,
  onPublishClick,
  onHomeClick,
  onSearch,
  unreadMessages = 0,
  unreadNotifications = 0
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-guinda-700 to-guinda-900 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-guinda-900">Marketplace</h1>
              <p className="text-xs text-gray-600">Universidad Politécnica del Valle de México</p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          {showSearchBar && (
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos, libros, electrónicos..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500 focus:border-transparent"
                  />
                </div>
                <button 
                  type="submit"
                  className="p-2 bg-guinda-700 hover:bg-guinda-800 text-white rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {/* Navegación */}
          <nav className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" className="hidden md:flex" onClick={onHomeClick}>
                  Explorar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onFavoritesClick}
                >
                  <Heart className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative"
                  onClick={onNotificationsClick}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative"
                  onClick={onMessagesClick}
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Button>
                <Button size="sm" className="bg-guinda-700 hover:bg-guinda-800 text-white hidden md:flex" onClick={onPublishClick}>
                  + Vender algo
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full p-0 w-10 h-10"
                  onClick={onProfileClick}
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName || 'Usuario'} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-verde-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onLoginClick}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  size="sm" 
                  className="bg-guinda-700 hover:bg-guinda-800 text-white"
                  onClick={onRegisterClick}
                >
                  Registrarse
                </Button>
              </>
            )}
          </nav>
        </div>

        {/* Barra de búsqueda móvil */}
        {showSearchBar && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500 focus:border-transparent"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}