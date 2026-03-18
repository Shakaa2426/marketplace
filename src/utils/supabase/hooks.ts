import { useState, useEffect } from 'react';
import { createClient } from './client';
import { supabaseUrl, publicAnonKey } from './info';
import type { User, Session } from '@supabase/supabase-js';

const supabase = createClient();

// ============================================================================
// TIPOS
// ============================================================================

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  matricula?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  condition: string;
  location?: string;
  image_url?: string;
  available: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

export interface Conversation {
  id: string;
  product_id?: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  products?: Product;
  buyer?: Profile;
  seller?: Profile;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined data
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// ============================================================================
// HOOK: useAuth - Manejo de autenticación
// ============================================================================

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sesión inicial:', session ? 'Usuario autenticado' : 'Sin sesión');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Cambio de autenticación:', _event, session ? 'Usuario autenticado' : 'Sin sesión');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      console.log('Cargando perfil para userId:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      console.log('Perfil cargado:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, matricula?: string) => {
    try {
      console.log('Intentando registrar usuario:', email);
      
      // Use standard Supabase signUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            matricula: matricula || null,
          },
          emailRedirectTo: undefined, // No redirect needed for prototype
        },
      });

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }

      console.log('Usuario registrado:', data);

      // If user is created but not confirmed, we need to handle it
      if (data.user && !data.session) {
        console.warn('Usuario creado pero sin sesión activa - probablemente requiere confirmación de email');
        // Try to use server endpoint to confirm the user
        try {
          console.log('Llamando a confirm-user endpoint...');
          const confirmResponse = await fetch(`${supabaseUrl}/functions/v1/TU_EDGE_FUNCTION/confirm-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ userId: data.user.id }),
          });
          
          const confirmResult = await confirmResponse.json();
          console.log('Resultado de confirmación:', confirmResponse.status, confirmResult);
          
          if (confirmResult.success) {
            console.log('Usuario confirmado exitosamente');
          }
        } catch (confirmError) {
          console.error('Error confirmando usuario:', confirmError);
        }
      } else if (data.session) {
        console.log('Usuario registrado con sesión activa');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('SignUp error completo:', error);
      return { data: null, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error details:', error);
        throw error;
      }
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in catch error:', error);
      return { data: null, error: error.message || 'Error de conexión. Por favor verifica tu conexión a internet.' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}

// ============================================================================
// HOOK: useProducts - Manejo de productos
// ============================================================================

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProducts = async (filters?: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    userId?: string;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.condition) {
        query = query.eq('condition', filters.condition);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Incrementar vistas
      await supabase.rpc('increment_product_views', { product_uuid: id });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const createProduct = async (product: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: user?.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }
      
      // Refrescar la lista de productos después de crear uno nuevo
      await fetchProducts();
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Create product error:', error);
      return { data: null, error: error.message };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

// ============================================================================
// HOOK: useFavorites - Manejo de favoritos
// ============================================================================

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds([]);
      setLoading(false);
    }
  }, [userId]);

  const fetchFavorites = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          products (
            *,
            profiles (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
      setFavoriteIds((data || []).map(f => f.product_id));
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (productId: string) => {
    if (!userId) return { error: 'User not logged in' };

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, product_id: productId }])
        .select()
        .single();

      if (error) throw error;
      setFavoriteIds(prev => [...prev, productId]);
      await fetchFavorites();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const removeFavorite = async (productId: string) => {
    if (!userId) return { error: 'User not logged in' };

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      setFavoriteIds(prev => prev.filter(id => id !== productId));
      await fetchFavorites();
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (favoriteIds.includes(productId)) {
      return await removeFavorite(productId);
    } else {
      return await addFavorite(productId);
    }
  };

  const isFavorite = (productId: string) => {
    return favoriteIds.includes(productId);
  };

  return {
    favorites,
    favoriteIds,
    loading,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}

// ============================================================================
// HOOK: useConversations - Manejo de conversaciones
// ============================================================================

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  const fetchConversations = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          products (*),
          buyer:buyer_id (*),
          seller:seller_id (*)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (productId: string, buyerId: string, sellerId: string) => {
    try {
      // Verificar si ya existe una conversación
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('product_id', productId)
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (existing) {
        return { data: existing, error: null };
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert([{ product_id: productId, buyer_id: buyerId, seller_id: sellerId }])
        .select()
        .single();

      if (error) throw error;
      await fetchConversations();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
  };
}

// ============================================================================
// HOOK: useMessages - Manejo de mensajes
// ============================================================================

export function useMessages(conversationId?: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      subscribeToMessages();
    } else {
      setMessages([]);
      setLoading(false);
    }

    return () => {
      if (conversationId) {
        supabase.channel(`messages:${conversationId}`).unsubscribe();
      }
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();
  };

  const sendMessage = async (content: string) => {
    if (!conversationId) return { error: 'No conversation selected' };
    if (!user) return { error: 'User not logged in' };

    try {
      // Primero, obtener información de la conversación para saber quién es el receptor
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('buyer_id, seller_id, products(title)')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      // Determinar quién es el receptor (el que NO es el sender)
      const receiverId = conversation.buyer_id === user.id 
        ? conversation.seller_id 
        : conversation.buyer_id;

      // Insertar el mensaje
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        }])
        .select()
        .single();

      if (error) throw error;

      // Crear notificación para el receptor
      const productTitle = conversation.products?.title || 'un producto';
      await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'message',
          title: 'Nuevo mensaje',
          message: `Tienes un mensaje nuevo sobre "${productTitle}"`,
          link: conversationId,
          is_read: false,
        });

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    messages,
    loading,
    fetchMessages,
    sendMessage,
    markAsRead,
  };
}

// ============================================================================
// HOOK: useNotifications - Manejo de notificaciones
// ============================================================================

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      subscribeToNotifications();
    }

    return () => {
      supabase.channel(`notifications:${userId}`).unsubscribe();
    };
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!userId) return;

    supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((current) => [payload.new as Notification, ...current]);
          setUnreadCount((count) => count + 1);
        }
      )
      .subscribe();
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds);

      if (error) throw error;
      setNotifications((current) =>
        current.map((n) =>
          notificationIds.includes(n.id) ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((count) => Math.max(0, count - notificationIds.length));
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      setNotifications((current) =>
        current.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

export async function uploadImage(file: File, bucket: 'product-images' | 'avatars') {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    return { url: null, error: error.message };
  }
}