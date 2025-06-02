import React, { useState, useEffect } from 'react';
import { RawMaterialFormData } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';

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
    quantity: 0,
    unit: 'm²',
    price: 0,
    supplier: ''
  };

  const [formData, setFormData] = useState<RawMaterialFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof RawMaterialFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof RawMaterialFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumberChange = (field: 'quantity' | 'price', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    handleChange(field, numValue);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RawMaterialFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Cantidad"
            type="number"
            value={formData.quantity.toString()}
            onChange={(e) => handleNumberChange('quantity', e.target.value)}
            min="1"
            step="1"
            error={errors.quantity}
            required
            fullWidth
          />
          
          <Input
            label="Unidad"
            value="m²"
            readOnly
            fullWidth
          />

        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Precio ($)"
            type="number"
            value={formData.price.toString()}
            onChange={(e) => handleNumberChange('price', e.target.value)}
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