import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Heart, MessageCircle, Package, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useNotifications } from '../utils/supabase/hooks';
import { useAuth } from '../utils/supabase/hooks';
import { toast } from 'sonner@2.0.3';

interface NotificationsPageProps {
  onBack: () => void;
  onMessageClick?: (conversationId: string) => void;
}

export function NotificationsPage({ onBack, onMessageClick }: NotificationsPageProps) {
  const { user } = useAuth();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications(user?.id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'favorite': return <Heart className="w-5 h-5 text-red-600" />;
      case 'product_sold': 
      case 'product_inquiry': return <Package className="w-5 h-5 text-amber-600" />;
      case 'system': return <CheckCircle className="w-5 h-5 text-verde-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Justo ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead([notification.id]);
    }
    
    // Si es una notificación de mensaje, navegar a la conversación
    if (notification.type === 'message' && notification.link && onMessageClick) {
      onMessageClick(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-guinda-900">Notificaciones</h1>
              {unreadCount > 0 && (
                <span className="bg-guinda-600 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-guinda-700"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como leídas
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinda-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No tienes notificaciones</p>
              <p className="text-gray-400 text-sm">
                Te notificaremos cuando haya actividad en tu cuenta
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition cursor-pointer hover:border-guinda-300 ${
                    notification.is_read 
                      ? 'border-gray-200 bg-white' 
                      : 'border-guinda-200 bg-guinda-50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-gray-900">{notification.title}</h4>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-guinda-600 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{notification.message}</p>
                      <p className="text-gray-400 text-xs">{getTimeAgo(notification.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}