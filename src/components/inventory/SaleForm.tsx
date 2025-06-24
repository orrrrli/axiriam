import React, { useState, useEffect } from 'react';
import { SaleFormData, Item } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

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
    socialMedia: '',
    trackingNumber: '',
    invoiceRequired: false,
    shippingType: 'local',
    localShippingOption: 'meeting-point',
    localAddress: '',
    nationalShippingCarrier: 'estafeta',
    shippingDescription: '',
    totalAmount: 0,
    items: []
  };

  const [formData, setFormData] = useState<SaleFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof SaleFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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

  const handleItemToggle = (itemId: string) => {
    setFormData(prev => {
      const isSelected = prev.items.includes(itemId);
      
      if (isSelected) {
        return {
          ...prev,
          items: prev.items.filter(id => id !== itemId)
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, itemId]
        };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SaleFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.socialMedia.trim()) {
      newErrors.socialMedia = 'Las redes sociales son requeridas';
    }
    
    if (formData.totalAmount < 0) {
      newErrors.totalAmount = 'El monto total no puede ser negativo';
    }
    
    if (formData.shippingType === 'local' && formData.localShippingOption === 'meeting-point' && !formData.localAddress?.trim()) {
      newErrors.localAddress = 'La dirección es requerida para punto de encuentro';
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

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' }
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
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
        
        <Input
          label="Redes Sociales"
          value={formData.socialMedia}
          onChange={(e) => handleChange('socialMedia', e.target.value)}
          placeholder="@usuario o perfil de red social"
          error={errors.socialMedia}
          required
          fullWidth
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Número de Rastreo"
            value={formData.trackingNumber}
            onChange={(e) => handleChange('trackingNumber', e.target.value)}
            placeholder="Número de seguimiento"
            fullWidth
          />
          
          <Input
            label="Monto Total ($)"
            type="number"
            value={formData.totalAmount.toString()}
            onChange={(e) => handleNumberChange('totalAmount', e.target.value)}
            min="0"
            step="0.01"
            error={errors.totalAmount}
            required
            fullWidth
          />
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
            
            {formData.localShippingOption === 'meeting-point' && (
              <Input
                label="Dirección"
                value={formData.localAddress || ''}
                onChange={(e) => handleChange('localAddress', e.target.value)}
                placeholder="Dirección del punto de encuentro"
                error={errors.localAddress}
                required
                fullWidth
              />
            )}
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

        {items.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Artículos Vendidos
            </label>
            <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto border border-gray-200 dark:bg-gray-700">
              {items.map((item) => (
                <div key={item.id} className="flex items-center mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    id={`item-${item.id}`}
                    checked={formData.items.includes(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`item-${item.id}`}
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {item.name} - ${item.price}
                  </label>
                </div>
              ))}
            </div>
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