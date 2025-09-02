import React, { useState, useEffect } from 'react';
import { OrderMaterialFormData, RawMaterial } from '../../types';
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
  isSubmitting = false,
}) => {
  const defaultFormData: OrderMaterialFormData = {
    materials: [
      {
        designs: [{ rawMaterialId: '', quantity: 1, addToInventory: true, customDesignName: '' }],
        
      },
    ],
    distributor: '',
    description: '',
    status: 'pending',
    parcel_service: 'Estafeta',
  };

  const [formData, setFormData] = useState<OrderMaterialFormData>(
    initialData || defaultFormData
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof OrderMaterialFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleDesignChange = (
    materialIndex: number,
    designIndex: number,
    field: keyof OrderMaterialFormData['materials'][number]['designs'][number],
    value: string | number | boolean
  ) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[materialIndex].designs[designIndex] = {
      ...updatedMaterials[materialIndex].designs[designIndex],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
    
    // Real-time validation for quantity
    if (field === 'quantity') {
      const fieldKey = `quantity_${materialIndex}_${designIndex}`;
      const newFieldErrors = { ...fieldErrors };
      
      if (typeof value === 'number' && value <= 0) {
        newFieldErrors[fieldKey] = 'La cantidad debe ser mayor a 0';
      } else {
        delete newFieldErrors[fieldKey];
      }
      
      setFieldErrors(newFieldErrors);
      
      // Clear materials error if all quantity issues are resolved
      if (errors.materials && Object.keys(newFieldErrors).length === 0) {
        const newErrors = { ...errors };
        delete newErrors.materials;
        setErrors(newErrors);
      }
    }
    
    // Clear materials error for rawMaterialId changes
    if (field === 'rawMaterialId' && value && errors.materials) {
      // Check if all materials now have rawMaterialId selected
      const allMaterialsSelected = updatedMaterials.every(m => 
        m.designs.every(d => d.addToInventory ? d.rawMaterialId : d.customDesignName)
      );
      
      if (allMaterialsSelected) {
        const newErrors = { ...errors };
        delete newErrors.materials;
        setErrors(newErrors);
      }
    }
    
    // Clear materials error for customDesignName changes
    if (field === 'customDesignName' && value && errors.materials) {
      const allMaterialsSelected = updatedMaterials.every(m => 
        m.designs.every(d => d.addToInventory ? d.rawMaterialId : d.customDesignName)
      );
      
      if (allMaterialsSelected) {
        const newErrors = { ...errors };
        delete newErrors.materials;
        setErrors(newErrors);
      }
    }
  };


  const addMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { designs: [{ rawMaterialId: '', quantity: 1, addToInventory: true, customDesignName: '' }]},
      ],
    }));
  };

  const removeMaterial = (materialIndex: number) => {
    if (formData.materials.length > 1) {
      setFormData((prev) => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== materialIndex),
      }));
    }
  };

  const addDesign = (materialIndex: number) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[materialIndex].designs.push({
      rawMaterialId: '',
      quantity: 1,
      addToInventory: true,
      customDesignName: ''
    });
    setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  const removeDesign = (materialIndex: number, designIndex: number) => {
    const updatedMaterials = [...formData.materials];
    if (updatedMaterials[materialIndex].designs.length > 1) {
      updatedMaterials[materialIndex].designs = updatedMaterials[
        materialIndex
      ].designs.filter((_, i) => i !== designIndex);
      setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OrderMaterialFormData, string>> = {};
    // Validate that all designs have either rawMaterialId (for inventory) or customDesignName (for custom)
    const invalidDesigns = formData.materials.some((m) =>
      m.designs.some((d) => 
        d.addToInventory ? !d.rawMaterialId : !d.customDesignName?.trim()
      )
    );
    
    if (invalidDesigns) {
      newErrors.materials = 'Los diseños de inventario deben tener un material seleccionado y los diseños personalizados deben tener un nombre';
    }

    if (!formData.distributor.trim())
      newErrors.distributor = 'El distribuidor es requerido';

    if (
      formData.materials.some((m) =>
        m.designs.some((d) => d.quantity <= 0)
      )
    ) newErrors.materials = 'La cantidad debe ser mayor a 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Ensure status is set correctly based on tracking number
      const submitData = { ...formData };
      
      // Auto-set status based on tracking number (frontend validation)
      if (!initialData) { // Only for new orders
        if (!submitData.trackingNumber || submitData.trackingNumber.trim() === '') {
          submitData.status = 'pending';
        } else {
          submitData.status = 'ordered';
        }
      }
      
      onSubmit(submitData);
    }
  };

  const materialOptions = rawMaterials.map((material) => ({
    value: material.id,
    label: material.name,
  }));

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'ordered', label: 'Enviado' },
    { value: 'received', label: 'Recibido' },
  ];

  const parcelOptions = [
    { value: 'Estafeta', label: 'Estafeta' },
    { value: 'DHL', label: 'DHL' },
  ];

  const formatNumber = (value: number, isInteger: boolean = false): string => {
    if (isInteger && Number.isInteger(value)) {
      return value.toString();
    }
    return value.toString();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Materiales
          </h2>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={addMaterial}
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Material
          </Button>
        </div>

        {formData.materials.map((material, materialIndex) => {
          return (
            <div
              key={materialIndex}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Material {materialIndex + 1}
                </h4>
                {formData.materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMaterial(materialIndex)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-bold"
                    aria-label="Eliminar material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Material Quantity */}
              <div className="mb-4">
              </div>

              <div className="mt-4 space-y-4">
                {material.designs.map((design, designIndex) => (
                  <div
                    key={designIndex}
                    className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Diseño {designIndex + 1}
                      </h5>
                      {material.designs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDesign(materialIndex, designIndex)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-bold"
                          aria-label="Eliminar diseño"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Inventory Toggle - Enhanced Design */}
                    <div className="mb-4">
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`addToInventory-${materialIndex}-${designIndex}`}
                              checked={design.addToInventory}
                              onChange={(e) => handleDesignChange(materialIndex, designIndex, 'addToInventory', e.target.checked)}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                            />
                            <label htmlFor={`addToInventory-${materialIndex}-${designIndex}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Usar material existente
                            </label>
                          </div>
                          <div className="flex-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              design.addToInventory 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            }`}>
                              {design.addToInventory ? '🏪 Inventario' : '🎨 Personalizado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {design.addToInventory ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Material de Inventario</span>
                          </div>
                          <Select
                            label="Seleccionar Tela"
                            value={design.rawMaterialId}
                            onChange={(value) =>
                              handleDesignChange(materialIndex, designIndex, 'rawMaterialId', value)
                            }
                            options={materialOptions}
                            required
                            fullWidth
                          />
                        </div>
                      ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-amber-900 dark:text-amber-300">Diseño Personalizado</span>
                          </div>
                          <Input
                            label="Nombre del diseño personalizado"
                            value={design.customDesignName || ''}
                            onChange={(e) => handleDesignChange(materialIndex, designIndex, 'customDesignName', e.target.value)}
                            placeholder="Ej: Tela especial Batman"
                            required
                            fullWidth
                          />
                          <div className="mt-2 flex items-start space-x-2">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-amber-900">!</span>
                              </div>
                            </div>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Este diseño se creará automáticamente como nuevo material en el inventario
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 mt-2">
                      <Input
                        label="Cantidad gorritos"
                        type="number"
                        value={formatNumber(design.quantity)}
                        onChange={(e) =>
                          handleDesignChange(
                            materialIndex,
                            designIndex,
                            'quantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="1"
                        placeholder="Ej: 5"
                        required
                        fullWidth
                        error={fieldErrors[`quantity_${materialIndex}_${designIndex}`]}
                      />
                    </div>

                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addDesign(materialIndex)}
                className="mt-3"
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar Diseño
              </Button>

              {/* Enhanced Summary Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-green-900 dark:text-green-300">
                      Resumen del Material
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-900 dark:text-green-200">
                      {formatNumber(material.designs.reduce((total, design) => total + design.quantity, 0), true)}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-400">gorritos total</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <div className="text-blue-600 dark:text-blue-400 font-medium">📦 Inventario</div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {material.designs.filter(d => d.addToInventory).length} diseño(s)
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <div className="text-amber-600 dark:text-amber-400 font-medium">🎨 Personalizado</div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {material.designs.filter(d => !d.addToInventory).length} diseño(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <Input
          label="Distribuidor"
          value={formData.distributor}
          onChange={(e) => handleChange('distributor', e.target.value)}
          placeholder="Nombre del distribuidor"
          error={errors.distributor}
          required
          fullWidth
        />

        <Select
          label="Paqueteria"
          value={formData.parcel_service}
          onChange={(value) => handleChange('parcel_service', value as 'Estafeta' | 'DHL')}
          options={parcelOptions}
          required
          fullWidth
        />

        <Input
          label="Numero de Seguimiento"
          value={formData.trackingNumber}
          onChange={(e) => handleChange('trackingNumber', e.target.value)}
          placeholder="Escribe el numero de guia"
          fullWidth
        />

        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe detalles especiales del pedido"
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
      
      {errors.materials && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error en materiales
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {errors.materials}
              </p>
            </div>
          </div>
        </div>
      )}


      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialData ? 'Actualizar Pedido' : 'Crear Pedido'}
        </Button>
      </div>
    </form>
  );
};

export default OrderMaterialForm;
