import React, { useState, useEffect, forwardRef } from 'react';
import { ItemFormData, RawMaterial } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Badge from '../ui/Badge';

interface ItemFormProps {
  initialData?: ItemFormData;
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
  rawMaterials: RawMaterial[];
  isSubmitting?: boolean;
  hideButtons?: boolean;
}

const ItemForm = forwardRef<HTMLFormElement, ItemFormProps>(({
  initialData,
  onSubmit,
  onCancel,
  rawMaterials,
  isSubmitting = false,
  hideButtons = false
}, ref) => {
  const defaultFormData: ItemFormData = {
    name: '',
    category: 'sencillo',
    type: 'algodon',
    description: '',
    quantity: 0,
    price: 0,
    materials: []
  };

  const [formData, setFormData] = useState<ItemFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState('');

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

  const handleMaterialSelect = (materialId: string) => {
    const selectedMaterial = rawMaterials.find(m => m.id === materialId);
    setFormData(prev => ({
      ...prev,
      materials: [materialId], // Single selection
      type: selectedMaterial ? selectedMaterial.type : prev.type // Auto-update item type
    }));
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

    // Validate raw material availability
    if (formData.materials.length > 0 && formData.quantity > 0) {
      const insufficientMaterials: string[] = [];
      
      for (const materialId of formData.materials) {
        const material = rawMaterials.find(rm => rm.id === materialId);
        if (material && material.quantity < formData.quantity) {
          insufficientMaterials.push(`${material.name} (disponible: ${material.quantity})`);
        }
      }
      
      if (insufficientMaterials.length > 0) {
        newErrors.quantity = `Materiales insuficientes: ${insufficientMaterials.join(', ')}`;
      }
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
    { value: 'completo', label: 'Completo' },
  ];

  const typeOptions = [
    { value: 'algodon', label: 'Algodon' },
    { value: 'normal', label: 'Normal' },
    { value: 'microfibra', label: 'Microfibra' },
    { value: 'microfibra-antifluido', label: 'Microfibra antifluido' },
    { value: 'stretch', label: 'Stretch' },
    { value: 'stretch-antifluido', label: 'Stretch antifluido' },
    { value: 'satin', label: 'Satin' },
  ];

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'algodon':
        return 'primary';
      case 'normal':
        return 'secondary';
      case 'microfibra':
        return 'default';
      case 'microfibra-antifluido':
        return 'default';
      case 'stretch':
        return 'success';
      case 'stretch-antifluido':
        return 'success';
      case 'satin':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'algodon':
        return 'Algodon';
      case 'normal':
        return 'Normal';
      case 'microfibra':
        return 'Microfibra';
      case 'microfibra-antifluido':
        return 'Microfibra antifluido';
      case 'stretch':
        return 'Stretch';
      case 'stretch-antifluido':
        return 'Stretch antifluido';
      case 'satin':
        return 'Satin';
      default:
        return 'Unknown';
    }
  };

  return (
    <form onSubmit={handleSubmit} ref={ref}>
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

        <Select
          label="Tipo de material"
          value={formData.type}
          onChange={(value) => handleChange('type', value)}
          options={typeOptions}
          error={errors.type}
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
            value={formData.quantity === 0 ? '' : formData.quantity.toString()}
            onChange={(e) => handleNumberChange('quantity', e.target.value === '' ? '0' : e.target.value)}
            min="0"
            step="1"
            error={errors.quantity}
            required
            fullWidth
          />
          
          <Input
            label="Precio ($)"
            type="number"
            value={formData.price === 0 ? '' : formData.price.toString()}
            onChange={(e) => handleNumberChange('price', e.target.value === '' ? '0' : e.target.value)}
            min="0"
            step="0.01"
            error={errors.price}
            required
            fullWidth
          />
        </div>

        {rawMaterials.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Material Usado (selecciona uno)
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Buscar material..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-colors duration-200"
              />
              {materialSearch && (
                <button
                  type="button"
                  onClick={() => setMaterialSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="mb-3 mt-2">
              <Select
                value={materialTypeFilter}
                onChange={setMaterialTypeFilter}
                options={[
                  { value: '', label: 'Todos los tipos' },
                  { value: 'algodon', label: 'Algodon' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'microfibra', label: 'Microfibra' },
                  { value: 'microfibra-antifluido', label: 'Microfibra antifluido' },
                  { value: 'stretch', label: 'Stretch' },
                  { value: 'stretch-antifluido', label: 'Stretch antifluido' },
                  { value: 'satin', label: 'Satin' }
                ]}
                fullWidth
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto border border-gray-200 dark:bg-gray-700 mt-2">
              {rawMaterials
                .filter(material => {
                  const matchesSearch = material.name.toLowerCase().includes(materialSearch.toLowerCase());
                  const matchesType = materialTypeFilter === '' || material.type === materialTypeFilter;
                  return matchesSearch && matchesType;
                })
                .map((material) => (
                <div key={material.id} className="flex items-center mb-2 last:mb-0">
                  <input
                    type="radio"
                    id={`material-${material.id}`}
                    name="material-selection"
                    checked={formData.materials.includes(material.id)}
                    onChange={() => handleMaterialSelect(material.id)}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300"
                  />
                  <label
                    htmlFor={`material-${material.id}`}
                    className={`ml-2 block text-sm cursor-pointer flex-1 leading-relaxed ${
                      material.quantity === 0 
                        ? 'text-red-500 dark:text-red-400' 
                        : material.quantity < formData.quantity && formData.quantity > 0
                          ? 'text-orange-500 dark:text-orange-400'
                          : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{material.name}</span>
                        <Badge variant={getTypeBadgeVariant(material.type)}>
                          {getTypeLabel(material.type)}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Dimensiones: {material.width}x{material.height}m
                      </span>
                      <span className={`text-xs ${
                      material.quantity === 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : material.quantity < formData.quantity && formData.quantity > 0
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Stock: {material.quantity} | Proveedor: {material.supplier || 'N/A'}
                      </span>
                    </div>
                  </label>
                </div>
              ))}
              
              {rawMaterials.filter(material => {
                const matchesSearch = material.name.toLowerCase().includes(materialSearch.toLowerCase());
                const matchesType = materialTypeFilter === '' || material.type === materialTypeFilter;
                return matchesSearch && matchesType;
              }).length === 0 && (materialSearch || materialTypeFilter) && (
                <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">
                  No se encontraron materiales
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!hideButtons && (
      <div className="mt-6 flex justify-end space-x-3 sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t border-gray-200 dark:border-gray-700 -mx-6 px-6">
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
    )}
    </form>
  );
});

ItemForm.displayName = 'ItemForm';

export default ItemForm;