import React, { useState, useEffect } from 'react';
import { QuoteFormData, Item, QuoteItem, SaleExtra } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import SearchableSelect from '../ui/SearchableSelect';
import DateInput from '../ui/DateInput';
import Button from '../ui/Button';
import { Trash2, Plus, FileText } from 'lucide-react';

interface QuoteFormProps {
  initialData?: QuoteFormData;
  onSubmit: (data: QuoteFormData) => void;
  onCancel: () => void;
  onGeneratePDF?: (data: QuoteFormData) => void;
  items: Item[];
  isSubmitting?: boolean;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onGeneratePDF,
  items,
  isSubmitting = false
}) => {
  const defaultFormData: QuoteFormData = {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    items: [],
    extras: [],
    discount: 0,
    notes: ''
  };

  const [formData, setFormData] = useState<QuoteFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormData, string>>>({});
  const [subtotal, setSubtotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Calculate totals whenever items, extras, or discount change
  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.extras, formData.discount]);

  const calculateTotals = () => {
    // Calculate items total
    const itemsTotal = formData.items.reduce((total, quoteItem) => {
      return total + (quoteItem.unitPrice * quoteItem.quantity);
    }, 0);

    // Calculate extras total
    const extrasTotal = formData.extras.reduce((total, extra) => {
      return total + extra.price;
    }, 0);

    // Calculate subtotal before discount
    const newSubtotal = itemsTotal + extrasTotal;
    
    // Apply discount
    const newTotal = Math.max(0, newSubtotal - formData.discount);
    
    setSubtotal(newSubtotal);
    setTotalAmount(newTotal);
  };

  const handleChange = (field: keyof QuoteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumberChange = (field: 'discount', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    handleChange(field, numValue);
  };

  // Quote Items Management
  const addQuoteItem = () => {
    const newQuoteItem: QuoteItem = {
      itemId: '',
      quantity: 1,
      unitPrice: 0,
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newQuoteItem]
    }));
  };

  const removeQuoteItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateQuoteItem = (index: number, field: keyof QuoteItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-fill unit price when item is selected
          if (field === 'itemId' && value) {
            const selectedItem = items.find(item => item.id === value);
            if (selectedItem) {
              updatedItem.unitPrice = selectedItem.price;
              updatedItem.description = selectedItem.name;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Extras Management
  const addExtra = () => {
    const newExtra: SaleExtra = {
      description: 'Botones',
      price: 0
    };
    setFormData(prev => ({
      ...prev,
      extras: [...prev.extras, newExtra]
    }));
  };

  const removeExtra = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index)
    }));
  };

  const updateExtra = (index: number, field: keyof SaleExtra, value: any) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.map((extra, i) => 
        i === index ? { ...extra, [field]: value } : extra
      )
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof QuoteFormData, string>> = {};
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'El nombre del cliente es requerido';
    }
    
    if (formData.clientEmail && !/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'El email no es válido';
    }
    
    if (!formData.validUntil) {
      newErrors.validUntil = 'La fecha de validez es requerida';
    } else if (formData.validUntil <= new Date()) {
      newErrors.validUntil = 'La fecha de validez debe ser futura';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un producto';
    } else {
      // Validate that all items have itemId, quantity > 0, and unitPrice >= 0
      const invalidItems = formData.items.filter(item => 
        !item.itemId || item.quantity <= 0 || item.unitPrice < 0
      );
      
      if (invalidItems.length > 0) {
        newErrors.items = 'Todos los productos deben tener un artículo seleccionado, cantidad mayor a 0 y precio válido';
      }
    }

    // Validate extras
    if (formData.extras.some(extra => extra.price < 0)) {
      newErrors.extras = 'El precio de los extras no puede ser negativo';
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

  const handleGeneratePDF = () => {
    if (validateForm() && onGeneratePDF) {
      onGeneratePDF(formData);
    }
  };

  const extraCategoryOptions = [
    { value: 'botones', label: 'Botones' },
    { value: 'tira absorbente', label: 'Tira absorbente' },
    { value: 'nombre bordado', label: 'Nombre bordado' },
    { value: 'personalizado', label: 'Personalizado' },
    { value: 'nombre vinil', label: 'Nombre vinil' }
  ];

  const itemOptions = items.map(item => ({
    value: item.id,
    label: `${item.name} - ${item.category} - ${item.type} - $${item.price}`
  }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Client Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Información del Cliente
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre del Cliente"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              placeholder="Nombre completo"
              error={errors.clientName}
              required
              fullWidth
            />
            
            <Input
              label="Empresa (Opcional)"
              value={formData.clientCompany || ''}
              onChange={(e) => handleChange('clientCompany', e.target.value)}
              placeholder="Nombre de la empresa"
              fullWidth
            />
            
            <Input
              label="Email (Opcional)"
              type="email"
              value={formData.clientEmail || ''}
              onChange={(e) => handleChange('clientEmail', e.target.value)}
              placeholder="cliente@email.com"
              error={errors.clientEmail}
              fullWidth
            />
            
            <Input
              label="Teléfono (Opcional)"
              value={formData.clientPhone || ''}
              onChange={(e) => handleChange('clientPhone', e.target.value)}
              placeholder="5551234567"
              fullWidth
            />
          </div>
          
          <DateInput
            label="Válida hasta"
            value={formData.validUntil.toISOString().split('T')[0]}
            onChange={(e) => handleChange('validUntil', new Date(e.target.value))}
            error={errors.validUntil}
            required
            fullWidth
          />
        </div>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productos {items.length === 0 && <span className="text-red-500 text-sm font-normal">(No hay productos disponibles)</span>}
            </h3>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={addQuoteItem}
              disabled={items.length === 0}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Producto
            </Button>
          </div>

          {items.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    No hay productos disponibles
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Para crear una cotización necesitas tener productos en tu inventario. 
                      Ve a la sección de <strong>Productos</strong> para crear algunos productos primero.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.items.map((quoteItem, index) => {
            const selectedItem = items.find(item => item.id === quoteItem.itemId);
            const itemSubtotal = quoteItem.unitPrice * quoteItem.quantity;

            return (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Producto {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeQuoteItem(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <SearchableSelect
                      label="Artículo"
                      value={quoteItem.itemId}
                      onChange={(value) => updateQuoteItem(index, 'itemId', value)}
                      options={itemOptions}
                      placeholder="Buscar producto..."
                      required
                      fullWidth
                    />
                  </div>
                  <Input
                    label="Cantidad"
                    type="number"
                    value={quoteItem.quantity === 0 ? '' : quoteItem.quantity.toString()}
                    onChange={(e) => updateQuoteItem(index, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
                    min="0"
                    step="1"
                    required
                    fullWidth
                  />
                </div>

                <div className="mt-3">
                  <Input
                    label="Descripción (Opcional)"
                    value={quoteItem.description || ''}
                    onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                    placeholder="Descripción personalizada del producto"
                    fullWidth
                  />
                </div>

                {selectedItem && (
                  <div className="mt-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-900 dark:text-blue-300">
                          Precio unitario: ${selectedItem.price} | Stock: {selectedItem.quantity}
                        </span>
                        <span className="font-semibold text-blue-900 dark:text-blue-200">
                          Subtotal: ${itemSubtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {errors.items && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
          )}
        </div>

        {/* Extras Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Extras
            </h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addExtra}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Extra
            </Button>
          </div>

          {formData.extras.map((extra, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Extra {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeExtra(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Eliminar extra"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Categoría"
                  value={extra.description}
                  onChange={(value) => updateExtra(index, 'description', value)}
                  options={extraCategoryOptions}
                  required
                  fullWidth
                />

                <Input
                  label="Precio ($)"
                  type="number"
                  value={extra.price === 0 ? '' : extra.price.toString()}
                  onChange={(e) => updateExtra(index, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                  fullWidth
                />
              </div>
            </div>
          ))}

          {errors.extras && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.extras}</p>
          )}
        </div>
        
        {/* Discount Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Descuento
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
            <Input
              label="Descuento ($)"
              type="number"
              value={formData.discount === 0 ? '' : formData.discount.toString()}
              onChange={(e) => handleNumberChange('discount', e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
              fullWidth
            />
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notas Adicionales
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Notas adicionales para el cliente..."
              rows={3}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 sm:text-sm transition-colors duration-200"
            />
          </div>
        </div>
        
        {/* Total Amount Display */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-700">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-800 dark:text-green-400">
                Subtotal (productos + extras):
              </span>
              <span className="text-green-800 dark:text-green-400">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {formData.discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-600 dark:text-red-400">
                  Descuento:
                </span>
                <span className="text-red-600 dark:text-red-400">
                  -${formData.discount.toFixed(2)}
                </span>
              </div>
            )}
            <hr className="border-green-300 dark:border-green-600" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-green-900 dark:text-green-300">
                Total de la Cotización:
              </span>
              <span className="text-xl font-bold text-green-900 dark:text-green-200">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
            Por favor corrige los siguientes errores:
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancelar
        </Button>
        {onGeneratePDF && (
          <Button 
            type="button" 
            variant="secondary"
            onClick={handleGeneratePDF}
            disabled={isSubmitting}
          >
            <FileText className="w-4 h-4 mr-1" />
            Generar PDF
          </Button>
        )}
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isSubmitting}
        >
          {initialData ? 'Actualizar Cotización' : 'Crear Cotización'}
        </Button>
      </div>
    </form>
  );
};

export default QuoteForm;
