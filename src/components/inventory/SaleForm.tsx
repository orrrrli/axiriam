import React, { useState, useEffect } from 'react';
import { SaleFormData, Item, SaleItem, SaleExtra } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Trash2, Plus } from 'lucide-react';

interface SaleFormProps {
  initialData?: SaleFormData;
  onSubmit: (data: SaleFormData) => void;
  onCancel: () => void;
  items: Item[];
  isSubmitting?: boolean;
}

const SaleForm: React.FC<SaleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  items,
  isSubmitting = false
}) => {
  const defaultFormData: SaleFormData = {
    name: '',
    status: 'pending',
    socialMediaPlatform: 'instagram',
    socialMediaUsername: '',
    trackingNumber: '',
    invoiceRequired: false,
    shippingType: 'local',
    localShippingOption: 'meeting-point',
    localAddress: '',
    nationalShippingCarrier: 'estafeta',
    shippingDescription: '',
    totalAmount: 0,
    items: [], // Keep for backward compatibility
    saleItems: [],
    extras: []
  };

  const [formData, setFormData] = useState<SaleFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof SaleFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Calculate total amount whenever items or extras change
  useEffect(() => {
    calculateTotalAmount();
  }, [formData.saleItems, formData.extras]);

  const calculateTotalAmount = () => {
    // Calculate items total
    const itemsTotal = formData.saleItems.reduce((total, saleItem) => {
      const item = items.find(item => item.id === saleItem.itemId);
      return total + (item ? item.price * saleItem.quantity : 0);
    }, 0);

    // Calculate extras total
    const extrasTotal = formData.extras.reduce((total, extra) => {
      return total + extra.price;
    }, 0);

    const newTotal = itemsTotal + extrasTotal;
    setFormData(prev => ({ ...prev, totalAmount: newTotal }));
  };

  const handleChange = (field: keyof SaleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumberChange = (field: 'totalAmount', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    handleChange(field, numValue);
  };

  // Sale Items Management
  const addSaleItem = () => {
    const newSaleItem: SaleItem = {
      itemId: '',
      quantity: 1
    };
    setFormData(prev => ({
      ...prev,
      saleItems: [...prev.saleItems, newSaleItem]
    }));
  };

  const removeSaleItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      saleItems: prev.saleItems.filter((_, i) => i !== index)
    }));
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      saleItems: prev.saleItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Extras Management
  const addExtra = () => {
    const newExtra: SaleExtra = {
      description: 'Botones',
      price: 0
    };
    setFormData(prev => ({
      ...prev,
      extras: [...prev.extras, newExtra]
    }));
  };

  const removeExtra = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index)
    }));
  };

  const updateExtra = (index: number, field: keyof SaleExtra, value: any) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.map((extra, i) => 
        i === index ? { ...extra, [field]: value } : extra
      )
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SaleFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.socialMediaUsername.trim()) {
      newErrors.socialMediaUsername = 'El usuario de red social es requerido';
    }
    
    if (formData.totalAmount < 0) {
      newErrors.totalAmount = 'El monto total no puede ser negativo';
    }
    
    if (formData.shippingType === 'local' && formData.localShippingOption === 'meeting-point' && !formData.localAddress?.trim()) {
      newErrors.localAddress = 'La dirección es requerida para punto de encuentro';
    }

    if (formData.shippingType === 'local' && formData.localShippingOption === 'pzexpress' && !formData.localAddress?.trim()) {
      newErrors.localAddress = 'La dirección es requerida para PZ Express';
    }

    // Validate sale items
    if (formData.saleItems.some(item => !item.itemId || item.quantity <= 0)) {
      newErrors.saleItems = 'Todos los productos deben tener un artículo seleccionado y cantidad mayor a 0';
    }

    // Validate extras
    if (formData.extras.some(extra => extra.price < 0)) {
      newErrors.extras = 'El precio de los extras no puede ser negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Update backward compatibility items array
      const itemIds = formData.saleItems.map(saleItem => saleItem.itemId);
      const submitData = {
        ...formData,
        items: itemIds
      };
      onSubmit(submitData);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' }
  ];

  const socialMediaOptions = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' }
  ];

  const shippingTypeOptions = [
    { value: 'local', label: 'Local' },
    { value: 'nacional', label: 'Nacional' }
  ];

  const localShippingOptions = [
    { value: 'meeting-point', label: 'Punto de encuentro' },
    { value: 'pzexpress', label: 'PZ Express' }
  ];

  const nationalCarrierOptions = [
    { value: 'estafeta', label: 'Estafeta' },
    { value: 'dhl', label: 'DHL' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'correos', label: 'Correos' }
  ];

  const extraCategoryOptions = [
    { value: 'botones', label: 'Botones' },
    { value: 'tira absorbente', label: 'Tira absorbente' },
    { value: 'nombre bordado', label: 'Nombre bordado' },
    { value: 'personalizado', label: 'Personalizado' },
    { value: 'nombre vinil', label: 'Nombre vinil' }
  ];

  const itemOptions = items.map(item => ({
    value: item.id,
    label: `${item.name} - $${item.price}`
  }));

  const getSocialMediaPlaceholder = () => {
    switch (formData.socialMediaPlatform) {
      case 'facebook':
        return 'nombre.apellido o perfil de Facebook';
      case 'instagram':
        return '@usuario_instagram';
      case 'whatsapp':
        return 'Número de teléfono (ej: 5551234567)';
      default:
        return 'Usuario de red social';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre del cliente"
            error={errors.name}
            required
            fullWidth
          />
          
          <Select
            label="Estado"
            value={formData.status}
            onChange={(value) => handleChange('status', value as 'pending' | 'shipped' | 'delivered')}
            options={statusOptions}
            required
            fullWidth
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Red Social"
            value={formData.socialMediaPlatform}
            onChange={(value) => handleChange('socialMediaPlatform', value as 'facebook' | 'instagram' | 'whatsapp')}
            options={socialMediaOptions}
            required
            fullWidth
          />
          
          <Input
            label="Usuario/Contacto"
            value={formData.socialMediaUsername}
            onChange={(e) => handleChange('socialMediaUsername', e.target.value)}
            placeholder={getSocialMediaPlaceholder()}
            error={errors.socialMediaUsername}
            required
            fullWidth
          />
        </div>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productos Vendidos
            </h3>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={addSaleItem}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Producto
            </Button>
          </div>

          {formData.saleItems.map((saleItem, index) => {
            const selectedItem = items.find(item => item.id === saleItem.itemId);
            const subtotal = selectedItem ? selectedItem.price * saleItem.quantity : 0;

            return (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Producto {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeSaleItem(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Select
                      label="Artículo"
                      value={saleItem.itemId}
                      onChange={(value) => updateSaleItem(index, 'itemId', value)}
                      options={itemOptions}
                      required
                      fullWidth
                    />
                  </div>

                  <Input
                    label="Cantidad"
                    type="number"
                    value={saleItem.quantity === 0 ? '' : saleItem.quantity.toString()}
                    onChange={(e) => updateSaleItem(index, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
                    min="0"
                    step="1"
                    required
                    fullWidth
                  />
                </div>

                {selectedItem && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-900 dark:text-blue-300">
                        Precio unitario: ${selectedItem.price}
                      </span>
                      <span className="font-semibold text-blue-900 dark:text-blue-200">
                        Subtotal: ${subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {errors.saleItems && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.saleItems}</p>
          )}
        </div>

        {/* Extras Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Extras
            </h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addExtra}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Extra
            </Button>
          </div>

          {formData.extras.map((extra, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Extra {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeExtra(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Eliminar extra"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Categoría"
                  value={extra.description}
                  onChange={(value) => updateExtra(index, 'description', value)}
                  options={extraCategoryOptions}
                  required
                  fullWidth
                />

                <Input
                  label="Precio ($)"
                  type="number"
                  value={extra.price === 0 ? '' : extra.price.toString()}
                  onChange={(e) => updateExtra(index, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  min="0"
                  step="1"
                  required
                  fullWidth
                />
              </div>
            </div>
          ))}

          {errors.extras && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.extras}</p>
          )}
        </div>

        {/* Total Amount Display */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-700">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-900 dark:text-green-300">
              Total de la Venta:
            </span>
            <span className="text-xl font-bold text-green-900 dark:text-green-200">
              ${formData.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
        
        <Input
          label="Número de Rastreo"
          value={formData.trackingNumber}
          onChange={(e) => handleChange('trackingNumber', e.target.value)}
          placeholder="Número de seguimiento"
          fullWidth
        />
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="invoiceRequired"
            checked={formData.invoiceRequired}
            onChange={(e) => handleChange('invoiceRequired', e.target.checked)}
            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
          />
          <label htmlFor="invoiceRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Factura requerida
          </label>
        </div>
        
        <Select
          label="Tipo de Envío"
          value={formData.shippingType}
          onChange={(value) => handleChange('shippingType', value as 'local' | 'nacional')}
          options={shippingTypeOptions}
          required
          fullWidth
        />
        
        {formData.shippingType === 'local' && (
          <div className="space-y-4">
            <Select
              label="Opción de Envío Local"
              value={formData.localShippingOption || 'meeting-point'}
              onChange={(value) => handleChange('localShippingOption', value as 'meeting-point' | 'pzexpress')}
              options={localShippingOptions}
              fullWidth
            />
            
            <Input
              label="Dirección"
              value={formData.localAddress || ''}
              onChange={(e) => handleChange('localAddress', e.target.value)}
              placeholder={
                formData.localShippingOption === 'meeting-point' 
                  ? "Dirección del punto de encuentro" 
                  : "Dirección para PZ Express"
              }
              error={errors.localAddress}
              required
              fullWidth
            />
          </div>
        )}
        
        {formData.shippingType === 'nacional' && (
          <div className="space-y-4">
            <Select
              label="Paquetería"
              value={formData.nationalShippingCarrier || 'estafeta'}
              onChange={(value) => handleChange('nationalShippingCarrier', value as 'estafeta' | 'dhl' | 'fedex' | 'correos')}
              options={nationalCarrierOptions}
              fullWidth
            />
            
            <Input
              label="Descripción del Envío"
              value={formData.shippingDescription || ''}
              onChange={(e) => handleChange('shippingDescription', e.target.value)}
              placeholder="Detalles adicionales del envío"
              fullWidth
            />
          </div>
        )}
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
          {initialData ? 'Actualizar Venta' : 'Crear Venta'}
        </Button>
      </div>
    </form>
  );
};

export default SaleForm;