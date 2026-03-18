import { useState, useEffect } from 'react';
import { Upload, X, Loader2, CheckCircle, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../utils/supabase/hooks';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Button } from '../components/ui/button';

interface EditProductoPageProps {
  productId: string;
  onNavigate: (page: string) => void;
  onBack: () => void;
}

export function EditProductoPage({ productId, onNavigate, onBack }: EditProductoPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    precio: '',
    condicion: 'Usado',
    ubicacion: ''
  });

  const categorias = ['Libros', 'Electrónicos', 'Ropa', 'Apuntes', 'Otros'];
  const ubicaciones = ['Edificio A', 'Edificio B', 'Edificio C', 'Cafetería', 'Biblioteca'];

  useEffect(() => {
    if (user && productId) {
      console.log('EditProductoPage - Loading product:', productId);
      console.log('EditProductoPage - Current user:', user.id);
      loadProduct();
    } else {
      console.log('EditProductoPage - Waiting for user or productId', { user: user?.id, productId });
    }
  }, [productId, user]);

  const loadProduct = async () => {
    if (!user) {
      console.error('EditProductoPage - No user available');
      toast.error('Debes iniciar sesión para editar');
      onBack();
      return;
    }

    try {
      setLoadingProduct(true);
      console.log('EditProductoPage - Fetching product:', productId);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('EditProductoPage - Error fetching product:', error);
        throw error;
      }

      console.log('EditProductoPage - Product loaded:', data);
      console.log('EditProductoPage - Product user_id:', data.user_id);
      console.log('EditProductoPage - Current user id:', user.id);
      console.log('EditProductoPage - IDs match:', data.user_id === user.id);

      if (data.user_id !== user.id) {
        console.error('EditProductoPage - Permission denied. User IDs do not match');
        toast.error('No tienes permisos para editar este producto');
        onBack();
        return;
      }

      setFormData({
        titulo: data.title,
        descripcion: data.description,
        categoria: data.category,
        precio: data.price.toString(),
        condicion: data.condition,
        ubicacion: data.location
      });

      if (data.image_url) {
        setCurrentImageUrl(data.image_url);
        setImagePreview(data.image_url);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Error al cargar el producto');
      onBack();
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(currentImageUrl);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;

    try {
      setUploadingImage(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!formData.titulo || !formData.descripcion || !formData.categoria || !formData.precio || !formData.ubicacion) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (parseFloat(formData.precio) <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = currentImageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const { error } = await supabase
        .from('products')
        .update({
          title: formData.titulo,
          description: formData.descripcion,
          category: formData.categoria,
          price: parseFloat(formData.precio),
          condition: formData.condicion,
          location: formData.ubicacion,
          image_url: imageUrl,
        })
        .eq('id', productId);

      if (error) throw error;

      setSuccess(true);
      toast.success('Producto actualizado exitosamente');
      
      setTimeout(() => {
        onNavigate('mis-productos');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message || 'Error al actualizar producto');
      toast.error('Error al actualizar producto');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-guinda-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-verde-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-verde-600" />
          </div>
          <h2 className="text-guinda-900 mb-3">¡Producto actualizado!</h2>
          <p className="text-gray-600">
            Tu producto se ha actualizado exitosamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-guinda-900 mb-8">Editar Publicación</h1>

          {/* Información básica */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
                placeholder="Ej: Laptop HP Core i5"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Descripción *</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
                placeholder="Describe tu producto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Categoría *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
                >
                  <option value="">Seleccionar</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Precio *</label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Condición *</label>
                <select
                  value={formData.condicion}
                  onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Usado">Usado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Ubicación *</label>
                <select
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
                >
                  <option value="">Seleccionar</option>
                  {ubicaciones.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div className="mb-8">
            <label className="block text-sm mb-2 text-gray-700">Imagen del producto</label>
            
            {!imagePreview && !currentImageUrl ? (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-guinda-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Haz clic para subir una imagen</p>
                <p className="text-xs text-gray-400">PNG, JPG hasta 5MB</p>
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview || ''}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                {imageFile && (
                  <div className="absolute bottom-2 left-2 bg-verde-600 text-white text-xs px-2 py-1 rounded">
                    Nueva imagen
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={loading || uploadingImage}
              className="flex-1 bg-guinda-700 hover:bg-guinda-800 text-white"
              size="lg"
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              disabled={loading || uploadingImage}
              size="lg"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}