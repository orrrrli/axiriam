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
    unit: '',
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
      newErrors.name = 'Name is required';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
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
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter material name"
          error={errors.name}
          required
          fullWidth
        />
        
        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter material description"
          as="textarea"
          rows={3}
          fullWidth
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            value={formData.quantity.toString()}
            onChange={(e) => handleNumberChange('quantity', e.target.value)}
            min="0"
            step="1"
            error={errors.quantity}
            required
            fullWidth
          />
          
          <Input
            label="Unit"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            placeholder="g, kg, mL, etc."
            error={errors.unit}
            required
            fullWidth
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Price ($)"
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
            label="Supplier"
            value={formData.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            placeholder="Enter supplier name"
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
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isSubmitting}
        >
          {initialData ? 'Update Material' : 'Add Material'}
        </Button>
      </div>
    </form>
  );
};

export default RawMaterialForm;