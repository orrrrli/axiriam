import React, { useState, useEffect } from 'react';
import { OrderMaterialFormData, RawMaterial } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface OrderMaterialFormProps {
  initialData?: OrderMaterialFormData;
  onSubmit: (data: OrderMaterialFormData) => void;
  onCancel: () => void;
  rawMaterials: RawMaterial[];
  isSubmitting?: boolean;
}

const OrderMaterialForm: React.FC<OrderMaterialFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  rawMaterials,
  isSubmitting = false
}) => {
  const defaultFormData: OrderMaterialFormData = {
    rawMaterialId: '',
    distributor: '',
    description: '',
    quantity: 1,
    status: 'pending'
  };

  const [formData, setFormData] = useState<OrderMaterialFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderMaterialFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof OrderMaterialFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumberChange = (field: 'quantity', value: string) => {
    const numValue = value === '' ? 1 : parseInt(value);
    handleChange(field, numValue);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OrderMaterialFormData, string>> = {};
    
    if (!formData.rawMaterialId) {
      newErrors.rawMaterialId = 'La tela es requerida';
    }
    
    if (!formData.distributor.trim()) {
      newErrors.distributor = 'El distribuidor es requerido';
    }
    
    if (formData.quantity < 1) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
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

  const materialOptions = rawMaterials.map(material => ({
    value: material.id,
    label: material.name
  }));

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'ordered', label: 'Ordenado' },
    { value: 'received', label: 'Recibido' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Select
          label="Tela"
          value={formData.rawMaterialId}
          onChange={(value) => handleChange('rawMaterialId', value)}
          options={materialOptions}
          error={errors.rawMaterialId}
          required
          fullWidth
        />
        
        <Input
          label="Distribuidor"
          value={formData.distributor}
          onChange={(e) => handleChange('distributor', e.target.value)}
          placeholder="Ingresa el nombre del distribuidor"
          error={errors.distributor}
          required
          fullWidth
        />
        
        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe el pedido especial"
          fullWidth
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Cantidad (m²)"
            type="number"
            value={formData.quantity.toString()}
            onChange={(e) => handleNumberChange('quantity', e.target.value)}
            min="1"
            step="1"
            error={errors.quantity}
            required
            fullWidth
          />
          
          <Select
            label="Estado"
            value={formData.status}
            onChange={(value) => handleChange('status', value as 'pending' | 'ordered' | 'received')}
            options={statusOptions}
            required
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
          {initialData ? 'Actualizar Pedido' : 'Crear Pedido'}
        </Button>
      </div>
    </form>
  );
};

export default OrderMaterialForm;