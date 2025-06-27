import React, { useState, useEffect } from 'react';
import { OrderMaterialFormData, RawMaterial, OrderMaterialItem } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Trash2, Plus } from 'lucide-react';

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
    materials: [{ rawMaterialId: '', height: 1, width: 1, quantity: 1 }],
    distributor: '',
    description: '',
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

  const handleMaterialChange = (index: number, field: keyof OrderMaterialItem, value: any) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    setFormData(prev => ({ ...prev, materials: updatedMaterials }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { rawMaterialId: '', height: 1, width: 1, quantity: 1 }]
    }));
  };

  const removeMaterial = (index: number) => {
    if (formData.materials.length > 1) {
      setFormData(prev => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OrderMaterialFormData, string>> = {};
    
    if (formData.materials.some(m => !m.rawMaterialId)) {
      newErrors.materials = 'Todas las telas son requeridas';
    }
    
    if (!formData.distributor.trim()) {
      newErrors.distributor = 'El distribuidor es requerido';
    }
    
    if (formData.materials.some(m => m.quantity <= 0 || m.height <= 0 || m.width <= 0)) {
      newErrors.materials = 'Cantidad, alto y ancho deben ser mayores a 0';
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
      <div className="space-y-6">
        {/* Materials Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Materiales
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMaterial}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Material
            </Button>
          </div>
          
          {formData.materials.map((material, index) => {
            const calculatedArea = material.height * material.width;
            
            return (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-3 border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Material {index + 1}
                  </h4>
                  {formData.materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* 1. Material Selection */}
                  <Select
                    label="Seleccionar Tela"
                    value={material.rawMaterialId}
                    onChange={(value) => handleMaterialChange(index, 'rawMaterialId', value)}
                    options={materialOptions}
                    required
                    fullWidth
                  />
                  
                  {/* 2. Dimensions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Alto (m)"
                      type="number"
                      value={material.height.toString()}
                      onChange={(e) => handleMaterialChange(index, 'height', parseFloat(e.target.value) || 1)}
                      min="0.1"
                      step="0.1"
                      required
                      fullWidth
                    />
                    
                    <Input
                      label="Ancho (m)"
                      type="number"
                      value={material.width.toString()}
                      onChange={(e) => handleMaterialChange(index, 'width', parseFloat(e.target.value) || 1)}
                      min="0.1"
                      step="0.1"
                      required
                      fullWidth
                    />
                  </div>
                  
                  {/* Area Calculation Display */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Área calculada:
                      </span>
                      <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                        {calculatedArea.toFixed(2)} m²
                      </span>
                    </div>
                  </div>
                  
                  {/* 3. Final Quantity */}
                  <Input
                    label="Cantidad (m²)"
                    type="number"
                    value={material.quantity.toString()}
                    onChange={(e) => handleMaterialChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    step="1"
                    required
                    fullWidth
                  />
                </div>
              </div>
            );
          })}
          
          {errors.materials && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.materials}</p>
          )}
        </div>
        
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
        
        <Select
          label="Estado"
          value={formData.status}
          onChange={(value) => handleChange('status', value as 'pending' | 'ordered' | 'received')}
          options={statusOptions}
          required
          fullWidth
        />
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