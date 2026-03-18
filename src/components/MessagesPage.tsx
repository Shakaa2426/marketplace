import { ArrowLeft, Search, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useEffect, useRef } from 'react';
import { useAuth, useConversations, useMessages } from '../utils/supabase/hooks';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MessagesPageProps {
  onBack: () => void;
  targetSellerId?: string | null;
  targetProductId?: string | null;
  initialConversationId?: string | null;
}

export function MessagesPage({ onBack, targetSellerId, targetProductId, initialConversationId }: MessagesPageProps) {
  const { user } = useAuth();
  const { conversations, loading: conversationsLoading } = useConversations(user?.id);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId || null);
  const { messages, loading: messagesLoading, sendMessage } = useMessages(selectedConversation);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [creatingConversation, setCreatingConversation] = useState(false);

  // Efecto para seleccionar conversación inicial desde notificaciones
  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversation(initialConversationId);
    }
  }, [initialConversationId]);

  // Efecto para crear o encontrar conversación cuando se pasa targetSellerId
  useEffect(() => {
    if (user && targetSellerId && targetProductId) {
      findOrCreateConversation(targetSellerId, targetProductId);
    }
  }, [user, targetSellerId, targetProductId]);

  const findOrCreateConversation = async (sellerId: string, productId: string) => {
    if (!user) return;

    try {
      setCreatingConversation(true);

      // Buscar conversación existente
      const { data: existingConversations, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .eq('product_id', productId);

      if (searchError) throw searchError;

      if (existingConversations && existingConversations.length > 0) {
        // Conversación encontrada
        console.log('Conversación existente encontrada:', existingConversations[0].id);
        setSelectedConversation(existingConversations[0].id);
      } else {
        // Crear nueva conversación
        console.log('Creando nueva conversación');
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert([{
            buyer_id: user.id,
            seller_id: sellerId,
            product_id: productId
          }])
          .select()
          .single();

        if (createError) {
          // Si el error es por clave duplicada, buscar la conversación existente
          if (createError.code === '23505') {
            console.log('Conversación ya existe (condición de carrera), buscando...');
            const { data: retryConversations } = await supabase
              .from('conversations')
              .select('id')
              .eq('buyer_id', user.id)
              .eq('seller_id', sellerId)
              .eq('product_id', productId)
              .single();
            
            if (retryConversations) {
              setSelectedConversation(retryConversations.id);
              return;
            }
          }
          throw createError;
        }

        console.log('Nueva conversación creada:', newConv.id);
        setSelectedConversation(newConv.id);
        
        // Enviar mensaje de bienvenida automático
        setTimeout(async () => {
          const { data: productData } = await supabase
            .from('products')
            .select('title')
            .eq('id', productId)
            .single();

          if (productData) {
            const welcomeMessage = `Hola, estoy interesado en tu producto: ${productData.title}`;
            await supabase
              .from('messages')
              .insert([{
                conversation_id: newConv.id,
                sender_id: user.id,
                content: welcomeMessage,
                is_read: false
              }]);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error al crear/encontrar conversación:', error);
      toast.error('Error al iniciar conversación');
    } finally {
      setCreatingConversation(false);
    }
  };

  useEffect(() => {
    // Solo auto-seleccionar si no hay targetSellerId
    if (conversations.length > 0 && !selectedConversation && !targetSellerId) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, targetSellerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      try {
        await sendMessage(newMessage.trim());
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Error al enviar el mensaje');
      }
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.buyer_id === user?.id ? conv.seller : conv.buyer;
    return otherUser?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
    }
  };

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const otherUser = currentConversation 
    ? (currentConversation.buyer_id === user?.id ? currentConversation.seller : currentConversation.buyer)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex" style={{ height: '600px' }}>
          {/* Lista de chats */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-guinda-900 mb-3">Mensajes</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinda-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-gray-600 mb-2">No tienes conversaciones</p>
                  <p className="text-gray-400 text-sm">
                    Contacta a un vendedor para iniciar una conversación
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const otherUser = conv.buyer_id === user?.id ? conv.seller : conv.buyer;
                  const avatar = otherUser?.avatar_url || otherUser?.full_name?.charAt(0).toUpperCase() || '?';
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                        selectedConversation === conv.id ? 'bg-guinda-50 border-l-4 border-l-guinda-700' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-guinda-600 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                          {otherUser?.avatar_url ? (
                            <ImageWithFallback
                              src={otherUser.avatar_url}
                              alt={otherUser.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            avatar
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-gray-900 truncate">{otherUser?.full_name || 'Usuario'}</h4>
                            <span className="text-xs text-gray-500">{getTimeDisplay(conv.updated_at)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conv.product?.title || 'Sin producto'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat individual */}
          <div className={`${selectedConversation ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
            {selectedConversation && otherUser ? (
              <>
                {/* Header del chat */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 bg-guinda-600 rounded-full flex items-center justify-center text-white overflow-hidden">
                    {otherUser.avatar_url ? (
                      <ImageWithFallback
                        src={otherUser.avatar_url}
                        alt={otherUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      otherUser.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900">{otherUser.full_name}</h3>
                    {currentConversation?.product && (
                      <p className="text-sm text-gray-500 truncate">
                        {currentConversation.product.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinda-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No hay mensajes. ¡Envía el primero!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            message.sender_id === user?.id
                              ? 'bg-guinda-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${message.sender_id === user?.id ? 'text-guinda-200' : 'text-gray-500'}`}>
                            {new Date(message.created_at).toLocaleTimeString('es-MX', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input de mensaje */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      className="bg-guinda-700 hover:bg-guinda-800 text-white"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Selecciona una conversación para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}