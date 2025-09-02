import React, { useState, useEffect } from 'react';
import { SaleFormData, Item, SaleItem, SaleExtra } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import SearchableSelect from '../ui/SearchableSelect';
import DateInput from '../ui/DateInput';
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
    discount: 0,
    totalAmount: 0,
    deliveryDate: undefined,
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

  // Calculate total amount whenever items, extras, or discount change
  useEffect(() => {
    calculateTotalAmount();
  }, [formData.saleItems, formData.extras, formData.discount]);

  const calculateTotalAmount = () => {
    // Calculate items total
    const itemsTotal = formData.saleItems.filter(item => item.addToInventory).reduce((total, saleItem) => {
      const item = items.find(item => item.id === saleItem.itemId);
      return total + (item ? item.price * saleItem.quantity : 0);
    }, 0);

    // Calculate extras total
    const extrasTotal = formData.extras.reduce((total, extra) => {
      return total + extra.price;
    }, 0);

    // Calculate subtotal before discount
    const subtotal = itemsTotal + extrasTotal;
    
    // Apply discount
    const newTotal = Math.max(0, subtotal - formData.discount);
    setFormData(prev => ({ ...prev, totalAmount: newTotal }));
  };

  const handleChange = (field: keyof SaleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumberChange = (field: 'totalAmount' | 'discount', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    handleChange(field, numValue);
  };

  // Sale Items Management
  const addSaleItem = () => {
    const newSaleItem: SaleItem = {
      itemId: '',
      quantity: 1,
      addToInventory: true,
      customDesignName: ''
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
    if (formData.saleItems.length === 0) {
      newErrors.saleItems = 'Debe agregar al menos un producto';
    } else {
      // Validate inventory items
      const invalidInventoryItems = formData.saleItems.filter(item => 
        item.addToInventory && (!item.itemId || item.quantity <= 0)
      );
      
      // Validate custom design items
      const invalidCustomItems = formData.saleItems.filter(item => 
        !item.addToInventory && (!item.customDesignName?.trim() || item.quantity <= 0)
      );
      
      if (invalidInventoryItems.length > 0) {
        newErrors.saleItems = 'Los productos de inventario deben tener un artículo seleccionado y cantidad mayor a 0';
      } else if (invalidCustomItems.length > 0) {
        newErrors.saleItems = 'Los diseños personalizados deben tener un nombre y cantidad mayor a 0';
      }
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
      <div className="space-y-2">
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          </div>
        )}
          
        </div>

        <div>
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
                    
          <Input
            label="Número de Rastreo"
            value={formData.trackingNumber}
            onChange={(e) => handleChange('trackingNumber', e.target.value)}
            placeholder="Número de seguimiento"
            fullWidth
          />

        </div>
        <div className="space-y-6">
          {/* Products Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Productos
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

                  {/* Inventory Toggle */}
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`addToInventory-${index}`}
                        checked={saleItem.addToInventory}
                        onChange={(e) => updateSaleItem(index, 'addToInventory', e.target.checked)}
                        className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`addToInventory-${index}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Agregar a inventario (usar producto existente)
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      {saleItem.addToInventory ? (
                        <SearchableSelect
                          label="Artículo"
                          value={saleItem.itemId}
                          onChange={(value) => updateSaleItem(index, 'itemId', value)}
                          options={itemOptions}
                          placeholder="Buscar producto..."
                          required
                          fullWidth
                        />
                      ) : (
                        <Input
                          label="Nombre del diseño personalizado"
                          value={saleItem.customDesignName || ''}
                          onChange={(e) => updateSaleItem(index, 'customDesignName', e.target.value)}
                          placeholder="Ej: Diseño especial Batman"
                          required
                          fullWidth
                        />
                      )}
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

                  {saleItem.addToInventory && selectedItem && (
                    <div className="mt-3 space-y-2">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-blue-900 dark:text-blue-300">
                            Precio unitario: ${selectedItem.price}
                          </span>
                          <span className="font-semibold text-blue-900 dark:text-blue-200">
                            Subtotal: ${subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-md border ${
                        selectedItem.quantity === 0 
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                          : selectedItem.quantity < saleItem.quantity && saleItem.quantity > 0
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      }`}>
                        <div className="flex justify-between items-center text-sm">
                          <span className={`${
                            selectedItem.quantity === 0 
                              ? 'text-red-900 dark:text-red-300'
                              : selectedItem.quantity < saleItem.quantity && saleItem.quantity > 0
                                ? 'text-orange-900 dark:text-orange-300'
                                : 'text-green-900 dark:text-green-300'
                          }`}>
                            Stock disponible: {selectedItem.quantity}
                          </span>
                          {selectedItem.quantity < saleItem.quantity && saleItem.quantity > 0 && (
                            <span className="text-orange-700 dark:text-orange-400 font-medium text-xs">
                              ⚠️ Stock insuficiente
                            </span>
                          )}
                          {selectedItem.quantity === 0 && (
                            <span className="text-red-700 dark:text-red-400 font-medium text-xs">
                              ❌ Sin stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!saleItem.addToInventory && saleItem.customDesignName && (
                    <div className="mt-3">
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-700">
                        <div className="flex items-center text-sm">
                          <span className="text-amber-900 dark:text-amber-300">
                            ⚠️ Diseño personalizado: Se creará automáticamente en materiales
                          </span>
                        </div>
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
        </div>
        
        {/* Discount Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Descuento
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
            <Input
              label="Descuento ($)"
              type="number"
              value={formData.discount === 0 ? '' : formData.discount.toString()}
              onChange={(e) => handleNumberChange('discount', e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
              fullWidth
            />
          </div>
        </div>
        
        {/* Total Amount Display */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-700">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-800 dark:text-green-400">
                Subtotal (productos + extras):
              </span>
              <span className="text-green-800 dark:text-green-400">
                ${(formData.saleItems.filter(item => item.addToInventory).reduce((total, saleItem) => {
                  const item = items.find(item => item.id === saleItem.itemId);
                  return total + (item ? item.price * saleItem.quantity : 0);
                }, 0) + formData.extras.reduce((total, extra) => total + extra.price, 0)).toFixed(2)}
              </span>
            </div>
            {formData.saleItems.some(item => !item.addToInventory) && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-amber-800 dark:text-amber-400">
                  Diseños personalizados:
                </span>
                <span className="text-amber-800 dark:text-amber-400">
                  {formData.saleItems.filter(item => !item.addToInventory).length} diseño(s)
                </span>
              </div>
            )}
            {formData.discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-600 dark:text-red-400">
                  Descuento:
                </span>
                <span className="text-red-600 dark:text-red-400">
                  -${formData.discount.toFixed(2)}
                </span>
              </div>
            )}
            <hr className="border-green-300 dark:border-green-600" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-green-900 dark:text-green-300">
                Total de la Venta:
              </span>
              <span className="text-xl font-bold text-green-900 dark:text-green-200">
                ${formData.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
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

        <DateInput
          label="Fecha de entrega (opcional)"
          value={formData.deliveryDate}
          onChange={(e) => handleChange('deliveryDate', e.target.value ? new Date(e.target.value) : undefined)}
          fullWidth
        />
      </div>

      {/* Error Summary - Show all validation errors at bottom */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
            Por favor corrige los siguientes errores:
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

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