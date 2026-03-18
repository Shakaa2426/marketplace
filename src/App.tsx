import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ExplorePage } from './components/ExplorePage';
import { ProductDetail } from './components/ProductDetail';
import { ProfilePage } from './components/ProfilePage';
import { NotificationsPage } from './components/NotificationsPage';
import { MessagesPage } from './components/MessagesPage';
import { FavoritesPage } from './components/FavoritesPage';
import { NuevoProductoPage } from './pages/NuevoProductoPage';
import { MisProductosPage } from './pages/MisProductosPage';
import { EditProductoPage } from './pages/EditProductoPage';
import { SellerProfilePage } from './components/SellerProfilePage';
import { useAuth, useFavorites, useNotifications, useProducts } from './utils/supabase/hooks';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { supabase } from './utils/supabase/client';

type Page = 'landing' | 'login' | 'register' | 'explore' | 'product-detail' | 'profile' | 'notifications' | 'messages' | 'favorites' | 'nuevo-producto' | 'mis-productos' | 'edit-producto' | 'user-profile';

export default function App() {
  // Estado de navegación
  type Page = 'landing' | 'login' | 'register' | 'explore' | 'product-detail' | 'profile' | 'notifications' | 'messages' | 'favorites' | 'nuevo-producto' | 'mis-productos' | 'edit-producto' | 'user-profile';
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Hooks de Supabase
  const { user, profile, loading: authLoading, signIn: authSignIn, signUp: authSignUp } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites(user?.id);
  const { unreadCount: unreadNotifications } = useNotifications(user?.id);
  const { products, fetchProducts, updateProduct } = useProducts();

  const isLoggedIn = !!user;

  // Fetch user products for "Mis Productos"
  useEffect(() => {
    if (user && currentPage === 'mis-productos') {
      fetchProducts({ userId: user.id });
    }
  }, [user, currentPage]);

  // Redirigir a explore si el usuario ya está autenticado y está en landing
  useEffect(() => {
    if (!authLoading && user && currentPage === 'landing') {
      // Usuario autenticado en landing - mantener en landing
      // (No auto-redirigir para respetar la navegación del usuario)
    }
  }, [authLoading, user, currentPage]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  // Funciones de navegación específicas para cada pantalla
  const goToExplore = () => {
    // Limpiar búsqueda y categoría al volver a explorar
    setSearchQuery('');
    setSelectedCategory(null);
    navigateTo('explore');
  };

  const goToLanding = () => {
    navigateTo('landing');
  };

  const goToMisProductos = () => {
    navigateTo('mis-productos');
  };

  const handleLogin = () => {
    navigateTo('explore');
  };

  const handleRegister = () => {
    navigateTo('explore');
  };

  const handleProductClick = (productId: string) => {
    // Si no hay usuario y se intenta ver un producto, redirigir a login
    if (!user) {
      toast.error('Debes iniciar sesión para ver los detalles del producto');
      navigateTo('login');
      return;
    }
    setSelectedProductId(productId);
    navigateTo('product-detail');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    navigateTo('explore');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigateTo('explore');
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!user) {
      navigateTo('login');
      return;
    }
    await toggleFavorite(productId);
  };

  const handleLogout = () => {
    setCurrentPage('landing');
  };

  const handleContactSeller = (sellerId: string, productId: string) => {
    if (!user) {
      navigateTo('login');
      return;
    }
    setSelectedUserId(sellerId);
    setSelectedProductId(productId);
    navigateTo('messages');
  };

  const handleToggleProductActivo = async (productId: string, available: boolean) => {
    try {
      await updateProduct(productId, { available });
      // Refrescar productos después de actualizar
      if (user) {
        await fetchProducts({ userId: user.id });
      }
    } catch (error) {
      console.error('Error toggling product availability:', error);
    }
  };

  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId);
    navigateTo('edit-producto');
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Publicación eliminada correctamente');
      navigateTo('mis-productos');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar la publicación');
    }
  };

  const handleHomeClick = () => {
    if (isLoggedIn) {
      navigateTo('explore');
    } else {
      navigateTo('landing');
    }
  };

  const handleNotificationMessageClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    navigateTo('messages');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginForm 
            onLoginSuccess={handleLogin}
            onRegisterClick={() => navigateTo('register')}
            onBack={goToLanding}
          />
        );
      case 'register':
        return (
          <RegisterForm 
            onRegisterSuccess={handleRegister}
            onLoginClick={() => navigateTo('login')}
            onBack={goToLanding}
          />
        );
      case 'explore':
        return (
          <ExplorePage 
            onProductClick={handleProductClick}
            onBack={goToLanding}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            favorites={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case 'product-detail':
        return (
          <ProductDetail 
            productId={selectedProductId || ''}
            onBack={goToExplore}
            onContactSeller={handleContactSeller}
            onProductClick={handleProductClick}
            onViewSellerProfile={(sellerId) => {
              setSelectedUserId(sellerId);
              navigateTo('user-profile');
            }}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            isFavorite={selectedProductId ? favoriteIds.includes(selectedProductId) : false}
            onToggleFavorite={() => selectedProductId && handleToggleFavorite(selectedProductId)}
          />
        );
      case 'profile':
        return <ProfilePage onBack={goToExplore} onLogout={handleLogout} onNavigateToProducts={() => navigateTo('mis-productos')} />;
      case 'notifications':
        return <NotificationsPage onBack={goToExplore} onMessageClick={handleNotificationMessageClick} />;
      case 'messages':
        return <MessagesPage onBack={goToExplore} targetSellerId={selectedUserId} targetProductId={selectedProductId} initialConversationId={selectedConversationId} />;
      case 'favorites':
        return (
          <FavoritesPage 
            onBack={goToExplore}
            onProductClick={handleProductClick}
            favorites={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case 'nuevo-producto':
        return <NuevoProductoPage onNavigate={navigateTo} onBack={goToExplore} />;
      case 'mis-productos':
        return (
          <MisProductosPage 
            products={products}
            onNavigate={navigateTo}
            onProductClick={handleProductClick}
            onToggleProductActivo={handleToggleProductActivo}
            onBack={goToExplore}
          />
        );
      case 'user-profile':
        return (
          <SellerProfilePage
            sellerId={selectedUserId || ''}
            onBack={goToExplore}
            onProductClick={handleProductClick}
          />
        );
      case 'edit-producto':
        return (
          <EditProductoPage
            productId={selectedProductId || ''}
            onBack={goToMisProductos}
            onNavigate={navigateTo}
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage
            onExploreClick={goToExplore}
            onSellClick={() => user ? navigateTo('nuevo-producto') : navigateTo('login')}
            onCategoryClick={(category) => {
              setSelectedCategory(category);
              navigateTo('explore');
            }}
            onProductClick={handleProductClick}
            onSearch={(query) => {
              setSearchQuery(query);
              navigateTo('explore');
            }}
            onViewAllClick={goToExplore}
            isLoggedIn={!!user}
            onLoginClick={() => navigateTo('login')}
          />
        );
    }
  };

  const showHeaderFooter = currentPage !== 'login' && currentPage !== 'register';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-guinda-700 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showHeaderFooter && (
        <Header
          isLoggedIn={isLoggedIn}
          userName={profile?.full_name}
          userAvatar={profile?.avatar_url}
          showSearchBar={isLoggedIn && currentPage !== 'landing'}
          onLoginClick={() => navigateTo('login')}
          onRegisterClick={() => navigateTo('register')}
          onProfileClick={() => navigateTo('profile')}
          onNotificationsClick={() => navigateTo('notifications')}
          onMessagesClick={() => navigateTo('messages')}
          onFavoritesClick={() => navigateTo('favorites')}
          onPublishClick={() => navigateTo('nuevo-producto')}
          onHomeClick={handleHomeClick}
          onSearch={handleSearch}
          unreadMessages={0}
          unreadNotifications={unreadNotifications}
        />
      )}
      
      <main className="flex-1">
        {renderPage()}
      </main>

      {showHeaderFooter && <Footer />}
      <Toaster />
    </div>
  );
}