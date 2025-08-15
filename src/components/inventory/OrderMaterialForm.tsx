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
        designs: [{ rawMaterialId: '', height: 1, width: 1 }],
        quantity: 1,
      },
    ],
    distributor: '',
    description: '',
    status: 'pending',
  };

  const [formData, setFormData] = useState<OrderMaterialFormData>(
    initialData || defaultFormData
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof OrderMaterialFormData, string>>
  >({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof OrderMaterialFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleDesignChange = (
    materialIndex: number,
    designIndex: number,
    field: keyof OrderMaterialFormData['materials'][number]['designs'][number],
    value: any
  ) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[materialIndex].designs[designIndex] = {
      ...updatedMaterials[materialIndex].designs[designIndex],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  const handleMaterialQuantityChange = (materialIndex: number, quantity: number) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[materialIndex].quantity = quantity;
    setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  const addMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { designs: [{ rawMaterialId: '', height: 1, width: 1 }], quantity: 1 },
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
      height: 1,
      width: 1,
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
    if (
      formData.materials.some((m) =>
        m.designs.some((d) => !d.rawMaterialId)
      )
    ) newErrors.materials = 'Todos los diseños deben tener un material seleccionado';

    if (!formData.distributor.trim())
      newErrors.distributor = 'El distribuidor es requerido';

    if (
      formData.materials.some((m) =>
        m.designs.some((d) => d.height <= 0 || d.width <= 0)
      )
    ) newErrors.materials = 'Alto y ancho deben ser mayores a 0';

    if (
      formData.materials.some((m) => m.quantity <= 0)
    ) newErrors.materials = 'La cantidad debe ser mayor a 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  const materialOptions = rawMaterials.map((material) => ({
    value: material.id,
    label: material.name,
  }));

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'ordered', label: 'Ordenado' },
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
          const designsArea = material.designs.reduce(
            (sum, d) => sum + d.height * d.width,
            0
          );

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
                <Input
                  label="Cantidad"
                  type="number"
                  value={formatNumber(material.quantity, true)}
                  onChange={(e) =>
                    handleMaterialQuantityChange(materialIndex, parseInt(e.target.value) || 1)
                  }
                  min="1"
                  step="1"
                  placeholder="Ej: 5"
                  required
                  fullWidth
                />
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

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Input
                        label="Alto (m)"
                        type="number"
                        value={formatNumber(design.height)}
                        onChange={(e) =>
                          handleDesignChange(
                            materialIndex,
                            designIndex,
                            'height',
                            parseFloat(e.target.value) || 1
                          )
                        }
                        min="0.001"
                        step="0.001"
                        placeholder="Ej: 1.5"
                        required
                        fullWidth
                      />

                      <Input
                        label="Ancho (m)"
                        type="number"
                        value={formatNumber(design.width)}
                        onChange={(e) =>
                          handleDesignChange(
                            materialIndex,
                            designIndex,
                            'width',
                            parseFloat(e.target.value) || 1
                          )
                        }
                        min="0.001"
                        step="0.001"
                        placeholder="Ej: 2"
                        required
                        fullWidth
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

              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-md border border-green-300 dark:border-green-700 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-900 dark:text-green-300">
                    Cantidad total de este material:
                  </span>
                  <span className="text-sm font-bold text-green-900 dark:text-green-200">
                    {formatNumber(material.quantity, true)} unidades
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-green-700 dark:text-green-400">
                    Área total de diseños:
                  </span>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    {formatNumber(designsArea)} m²
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {errors.materials && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.materials}</p>
        )}

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