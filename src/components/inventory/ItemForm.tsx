import React, { useState, useEffect } from 'react';
import { ItemFormData, RawMaterial } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface ItemFormProps {
  initialData?: ItemFormData;
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
  rawMaterials: RawMaterial[];
  isSubmitting?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  rawMaterials,
  isSubmitting = false
}) => {
  const defaultFormData: ItemFormData = {
    name: '',
    category: 'sencillo',
    description: '',
    quantity: 0,
    price: 0,
    materials: []
  };

  const [formData, setFormData] = useState<ItemFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof ItemFormData, value: any) => {
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

  const handleMaterialToggle = (materialId: string) => {
    setFormData(prev => {
      const isSelected = prev.materials.includes(materialId);
      
      if (isSelected) {
        return {
          ...prev,
          materials: prev.materials.filter(id => id !== materialId)
        };
      } else {
        return {
          ...prev,
          materials: [...prev.materials, materialId]
        };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ItemFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
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

  const categoryOptions = [
    { value: 'sencillo', label: 'Sencillo' },
    { value: 'doble-vista', label: 'Doble vista' },
    { value: 'completo-ajustable', label: 'Completo-Ajustable' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Nombre del gorro"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ingresa el nombre"
          error={errors.name}
          required
          fullWidth
        />
        
        <Select
          label="Categoría"
          value={formData.category}
          onChange={(value) => handleChange('category', value)}
          options={categoryOptions}
          error={errors.category}
          required
          fullWidth
        />
        
        <Input
          label="Descripción"
          placeholder="Agrega una descripción del item"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          fullWidth
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Cantidad"
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
        </div>

        {rawMaterials.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materiales Usados
            </label>
            <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto border border-gray-200">
              {rawMaterials.map((material) => (
                <div key={material.id} className="flex items-center mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    id={`material-${material.id}`}
                    checked={formData.materials.includes(material.id)}
                    onChange={() => handleMaterialToggle(material.id)}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`material-${material.id}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {material.name} ({material.unit})
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
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isSubmitting}
        >
          {initialData ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;