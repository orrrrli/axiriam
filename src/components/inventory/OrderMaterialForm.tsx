import React, { useState, useEffect } from 'react';
import { OrderMaterialFormData, RawMaterial } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Trash2, Plus, Search } from 'lucide-react';

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
        designs: [{ rawMaterialId: '', quantity: 1, addToInventory: true, customDesignName: '', type: 'algodon' }],
        
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
  const [materialSearchQueries, setMaterialSearchQueries] = useState<{ [key: string]: string }>({});
  const [materialTypeFilters, setMaterialTypeFilters] = useState<{ [key: string]: string }>({});
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (initialData) {
      // When editing an existing order, ensure addToInventory is true for designs that have rawMaterialId
      // and add default type if missing
      const processedData = {
        ...initialData,
        materials: initialData.materials.map(material => ({
          ...material,
          designs: material.designs.map(design => ({
            ...design,
            // If design has a rawMaterialId, it means it was already created/selected, so set addToInventory to true
            addToInventory: design.rawMaterialId ? true : design.addToInventory,
            // Ensure type field exists with default value
            type: design.type || 'algodon'
          }))
        }))
      };
      setFormData(processedData);
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
        { designs: [{ rawMaterialId: '', quantity: 1, addToInventory: true, customDesignName: '', type: 'algodon' }]},
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
      customDesignName: '',
      type: 'algodon'
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

  const handleMaterialSearch = (materialIndex: number, designIndex: number, query: string) => {
    const searchKey = `${materialIndex}-${designIndex}`;
    setMaterialSearchQueries(prev => ({
      ...prev,
      [searchKey]: query
    }));
  };

  const handleMaterialTypeFilter = (materialIndex: number, designIndex: number, type: string) => {
    const searchKey = `${materialIndex}-${designIndex}`;
    setMaterialTypeFilters(prev => ({
      ...prev,
      [searchKey]: type
    }));
  };

  const toggleDropdown = (materialIndex: number, designIndex: number) => {
    const dropdownKey = `${materialIndex}-${designIndex}`;
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownKey]: !prev[dropdownKey]
    }));
  };

  const selectMaterial = (materialIndex: number, designIndex: number, materialId: string) => {
    handleDesignChange(materialIndex, designIndex, 'rawMaterialId', materialId);
    const dropdownKey = `${materialIndex}-${designIndex}`;
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownKey]: false
    }));
  };

  const getFilteredMaterials = (materialIndex: number, designIndex: number) => {
    const searchKey = `${materialIndex}-${designIndex}`;
    const searchQuery = materialSearchQueries[searchKey] || '';
    const typeFilter = materialTypeFilters[searchKey] || '';
    
    return rawMaterials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === '' || material.type === typeFilter;
      return matchesSearch && matchesType;
    });
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'algodon': return 'success';
      case 'normal': return 'danger';
      case 'stretch': return 'warning';
      case 'satin': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'algodon': return 'Algodon';
      case 'normal': return 'Normal';
      case 'stretch': return 'Stretch';
      case 'satin': return 'Satin';
      default: return type;
    }
  };

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
                              {design.addToInventory ? '🏪 Inventario' : 'Nuevo diseño'}
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
                          
                          {design.rawMaterialId ? (
                            // Selected Material Display
                            <div className="space-y-3">
                              {(() => {
                                const selectedMaterial = rawMaterials.find(m => m.id === design.rawMaterialId);
                                if (!selectedMaterial) return null;
                                
                                return (
                                  <div className="relative p-3 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                                    <div className="flex flex-col space-y-2">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                          {selectedMaterial.name}
                                        </h4>
                                        <Badge variant={getTypeBadgeVariant(selectedMaterial.type)}>
                                          {getTypeLabel(selectedMaterial.type)}
                                        </Badge>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center space-x-1">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                          </svg>
                                          <span>{selectedMaterial.width}×{selectedMaterial.height}m</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                          </svg>
                                          <span className={selectedMaterial.quantity === 0 ? 'text-red-500 font-medium' : selectedMaterial.quantity < 10 ? 'text-orange-500 font-medium' : ''}>
                                            Stock: {selectedMaterial.quantity}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>Proveedor: {selectedMaterial.supplier || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                              
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleDropdown(materialIndex, designIndex)}
                                className="w-full"
                              >
                                Cambiar Material
                              </Button>
                            </div>
                          ) : (
                            // Material Selection Button
                            <div className="relative">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => toggleDropdown(materialIndex, designIndex)}
                                className="w-full flex items-center justify-between"
                              >
                                <span>Seleccionar Material</span>
                                <svg className={`w-4 h-4 transition-transform ${openDropdowns[`${materialIndex}-${designIndex}`] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </Button>
                              
                              {openDropdowns[`${materialIndex}-${designIndex}`] && (
                                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                                  <div className="p-3">
                                    {/* Search Bar */}
                                    <div className="mb-3">
                                      <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                          type="text"
                                          value={materialSearchQueries[`${materialIndex}-${designIndex}`] || ''}
                                          onChange={(e) => handleMaterialSearch(materialIndex, designIndex, e.target.value)}
                                          placeholder="Buscar materiales..."
                                          className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                                        />
                                        {materialSearchQueries[`${materialIndex}-${designIndex}`] && (
                                          <button
                                            type="button"
                                            onClick={() => handleMaterialSearch(materialIndex, designIndex, '')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                          >
                                            <svg className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Type Filter */}
                                    <div className="mb-3">
                                      <Select
                                        value={materialTypeFilters[`${materialIndex}-${designIndex}`] || ''}
                                        onChange={(value) => handleMaterialTypeFilter(materialIndex, designIndex, value)}
                                        options={[
                                          { value: '', label: 'Todos los tipos' },
                                          { value: 'algodon', label: 'Algodon' },
                                          { value: 'normal', label: 'Normal' },
                                          { value: 'stretch', label: 'Stretch' },
                                          { value: 'satin', label: 'Satin' }
                                        ]}
                                        fullWidth
                                      />
                                    </div>

                                    {/* Material Cards */}
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {getFilteredMaterials(materialIndex, designIndex).map((material) => (
                                        <div
                                          key={material.id}
                                          onClick={() => selectMaterial(materialIndex, designIndex, material.id)}
                                          className="relative p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
                                        >
                                          <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {material.name}
                                              </h4>
                                              <Badge variant={getTypeBadgeVariant(material.type)}>
                                                {getTypeLabel(material.type)}
                                              </Badge>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                              <div className="flex items-center space-x-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                </svg>
                                                <span>{material.width}×{material.height}m</span>
                                              </div>
                                              <div className="flex items-center space-x-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <span className={material.quantity === 0 ? 'text-red-500 font-medium' : material.quantity < 10 ? 'text-orange-500 font-medium' : ''}>
                                                  Stock: {material.quantity}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                              </svg>
                                              <span>Proveedor: {material.supplier || 'N/A'}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      
                                      {getFilteredMaterials(materialIndex, designIndex).length === 0 && (materialSearchQueries[`${materialIndex}-${designIndex}`] || materialTypeFilters[`${materialIndex}-${designIndex}`]) && (
                                        <div className="text-center py-8">
                                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No se encontraron materiales</p>
                                          <p className="text-xs text-gray-400 dark:text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-amber-900 dark:text-amber-300">Diseño nuevo / Personalizado </span>
                          </div>
                          <div className="space-y-3">
                            <Input
                              label="Nombre del diseño"
                              value={design.customDesignName || ''}
                              onChange={(e) => handleDesignChange(materialIndex, designIndex, 'customDesignName', e.target.value)}
                              placeholder="Ej: Tela especial Batman"
                              required
                              fullWidth
                            />
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-amber-900 dark:text-amber-300">
                                Tipo de Material
                              </label>
                              <select
                                value={design.type || 'algodon'}
                                onChange={(e) => handleDesignChange(materialIndex, designIndex, 'type', e.target.value as 'algodon' | 'stretch' | 'normal' | 'satin')}
                                className="block w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 transition-colors duration-200"
                                required
                              >
                                <option value="algodon">Algodón</option>
                                <option value="normal">Normal</option>
                                <option value="stretch">Stretch</option>
                                <option value="satin">Satin</option>
                              </select>
                            </div>
                          </div>
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
                    <div className="text-amber-600 dark:text-amber-400 font-medium">Nuevos diseños</div>
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
