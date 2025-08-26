import React, { useState, useEffect, useRef } from 'react';
import { RawMaterialFormData } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Upload, X, Image } from 'lucide-react';

interface RawMaterialFormProps {
  initialData?: RawMaterialFormData;
  onSubmit: (data: RawMaterialFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const RawMaterialForm: React.FC<RawMaterialFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const defaultFormData: RawMaterialFormData = {
    name: '',
    description: '',
    width: 0,
    height: 0,
    quantity: 0,
    price: 0,
    supplier: '',
    imageUrl: ''
  };

  const [formData, setFormData] = useState<RawMaterialFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof RawMaterialFormData, string>>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.imageUrl || '');
    }
  }, [initialData]);

  const handleChange = (field: keyof RawMaterialFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumberChange = (field: 'width' | 'height' | 'quantity' | 'price', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    handleChange(field, numValue);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imageUrl: 'Por favor selecciona solo archivos de imagen' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageUrl: 'La imagen debe ser menor a 5MB' }));
      return;
    }

    setIsUploading(true);
    setErrors(prev => ({ ...prev, imageUrl: undefined }));

    // Create file reader to convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, imageUrl: result }));
      setIsUploading(false);
    };

    reader.onerror = () => {
      setErrors(prev => ({ ...prev, imageUrl: 'Error al cargar la imagen' }));
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RawMaterialFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.width <= 0) {
      newErrors.width = 'El ancho debe ser mayor a 0';
    }

    if (formData.height <= 0) {
      newErrors.height = 'El alto debe ser mayor a 0';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'La cantidad no puede ser negativa';
    }
    
    if (formData.price < 0) {
      newErrors.price = 'El precio no puede ser negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const totalArea = formData.width * formData.height;


  const getStepValue = (field: string) => {
    if (field === 'quantity') {
      return "1";
    }
    return "0.001";
  };

  const formatNumber = (value: number, isInteger: boolean = false): string => {
    if (isInteger && Number.isInteger(value)) {
      return value.toString();
    }
    return value.toString();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Nombre"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ingresa el nombre del material"
          error={errors.name}
          required
          fullWidth
        />
        
        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Ingresa una descripción del material"
          fullWidth
        />

        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Imagen del Diseño
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Seleccionar imagen"
          />
          
          <div className="flex flex-col space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleImageClick}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Cargando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar Imagen
                </>
              )}
            </Button>
            
            {imagePreview && (
              <div className="relative inline-block w-32 h-32">
                <img
                  src={imagePreview}
                  alt="Vista previa del diseño"
                  className="w-full h-full object-cover rounded-md border border-gray-300 dark:border-gray-600"
                  onError={() => {
                    setImagePreview('');
                    setErrors(prev => ({ ...prev, imageUrl: 'Error al cargar la imagen' }));
                  }}
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  aria-label="Eliminar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {!imagePreview && (
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center">
                <Image className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Sin imagen
                </span>
              </div>
            )}
          </div>
          
          {errors.imageUrl && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.imageUrl}</p>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formatos soportados: JPG, PNG, GIF, WebP (máx. 5MB)
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ancho (m)"
            type="number"
            value={formData.width === 0 ? '' : formatNumber(formData.width)}
            onChange={(e) => handleNumberChange('width', e.target.value === '' ? '0' : e.target.value)}
            min="0.001"
            step="0.001"
            placeholder="Ej: 1.5"
            error={errors.width}
            required
            fullWidth
          />
          
          <Input
            label="Alto (m)"
            type="number"
            value={formData.height === 0 ? '' : formatNumber(formData.height)}
            onChange={(e) => handleNumberChange('height', e.target.value === '' ? '0' : e.target.value)}
            min="0.001"
            step="0.001"
            placeholder="Ej: 2"
            error={errors.height}
            required
            fullWidth
          />
        </div>

        {(formData.width > 0 && formData.height > 0) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Área total:
              </span>
              <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                {formatNumber(totalArea)} m²
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Gorritos resultantes"
            type="number"
           value={formData.quantity === 0 ? '' : formatNumber(formData.quantity)}
           onChange={(e) => handleNumberChange('quantity', e.target.value === '' ? '0' : e.target.value)}
            min="0"
            step={getStepValue('quantity')}
            error={errors.quantity}
            required
            fullWidth
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Precio ($)"
            type="number"
            value={formData.price === 0 ? '' : formatNumber(formData.price)}
            onChange={(e) => handleNumberChange('price', e.target.value === '' ? '0' : e.target.value)}
            min="0"
            step="0.01"
            error={errors.price}
            required
            fullWidth
          />
          
          <Input
            label="Proveedor"
            value={formData.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            placeholder="Ingresa el nombre del proveedor"
            fullWidth
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isSubmitting}
        >
          {initialData ? 'Actualizar Material' : 'Agregar Material'}
        </Button>
      </div>
    </form>
  );
};

export default RawMaterialForm;