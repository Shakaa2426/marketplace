import { useState } from 'react';
import { Upload, X, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth, useProducts } from '../utils/supabase/hooks';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface NuevoProductoPageProps {
  onNavigate: (page: string) => void;
  onBack?: () => void;
}

export function NuevoProductoPage({ onNavigate, onBack }: NuevoProductoPageProps) {
  const { user } = useAuth();
  const { createProduct } = useProducts();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
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

      // Get public URL
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
      // Upload image if exists
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Create product
      await createProduct({
        title: formData.titulo,
        description: formData.descripcion,
        category: formData.categoria,
        price: parseFloat(formData.precio),
        condition: formData.condicion,
        location: formData.ubicacion,
        image_url: imageUrl,
      });

      setSuccess(true);
      toast.success('Producto publicado exitosamente');
      
      setTimeout(() => {
        onNavigate('mis-productos');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.message || 'Error al crear producto');
      toast.error('Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = formData.titulo && formData.descripcion && formData.categoria && formData.precio && formData.ubicacion && parseFloat(formData.precio) > 0;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-verde-600 mx-auto mb-4" />
          <h2 className="text-guinda-900 mb-2">¡Producto publicado exitosamente!</h2>
          <p className="text-gray-600">Redirigiendo a tus publicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-guinda-900 mb-2">Publicar Producto</h1>
          <p className="text-gray-600">
            Completa la información para publicar tu producto
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-guinda-700 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-guinda-700' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-guinda-700 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-guinda-700' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-guinda-700 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {/* Step 1: Información */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-guinda-900 mb-4">Información del Producto</h2>
              
              <div>
                <label className="block text-sm mb-2 text-gray-700">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Libro de Cálculo Diferencial"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Descripción *</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe tu producto, su estado, etc."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.descripcion.length}/500 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Categoría *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent bg-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Precio *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Condición *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condicion"
                      value="Nuevo"
                      checked={formData.condicion === 'Nuevo'}
                      onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                      className="w-4 h-4 text-guinda-700 border-gray-300 focus:ring-guinda-700"
                    />
                    <span>Nuevo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condicion"
                      value="Usado"
                      checked={formData.condicion === 'Usado'}
                      onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                      className="w-4 h-4 text-guinda-700 border-gray-300 focus:ring-guinda-700"
                    />
                    <span>Usado</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Ubicación en campus *</label>
                <select
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent bg-white"
                >
                  <option value="">Selecciona una ubicación</option>
                  {ubicaciones.map(ub => (
                    <option key={ub} value={ub}>{ub}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className="px-6 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Imágenes */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-guinda-900 mb-4">Imagen del Producto</h2>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Selecciona una imagen</p>
                  <p className="text-sm text-gray-500 mb-4">JPG, PNG o WebP (máx. 5MB)</p>
                  <label className="inline-block px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    Seleccionar imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <p className="text-sm text-gray-500">
                Puedes continuar sin imagen, pero se recomienda agregar al menos una foto del producto.
              </p>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Revisar */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-guinda-900 mb-4">Revisar y Publicar</h2>
              
              <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                {imagePreview && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Imagen</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Título</p>
                  <p className="text-gray-900">{formData.titulo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Descripción</p>
                  <p className="text-gray-900">{formData.descripcion}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p className="text-gray-900">{formData.categoria}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Precio</p>
                    <p className="text-verde-600">${parseFloat(formData.precio || '0').toLocaleString('es-MX')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Condición</p>
                    <p className="text-gray-900">{formData.condicion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="text-gray-900">{formData.ubicacion}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || uploadingImage}
                  className="px-6 py-3 bg-verde-600 text-white rounded-lg hover:bg-verde-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(loading || uploadingImage) && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? 'Publicando...' : uploadingImage ? 'Subiendo imagen...' : 'Publicar Ahora'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cancelar */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancelar y volver
          </button>
        </div>
      </div>
    </div>
  );
}