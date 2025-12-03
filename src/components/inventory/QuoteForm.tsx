import React, { useState, useEffect } from 'react';
import { QuoteFormData, Item, QuoteItem, SaleExtra } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import SearchableSelect from '../ui/SearchableSelect';
import DateInput from '../ui/DateInput';
import Button from '../ui/Button';
import { Trash2, Plus, FileText, Package, Tag, FileText as FileTextIcon } from 'lucide-react';

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
    notes: '',
    iva: 16,
    paymentMethod: 'Efectivo',
    hasGeneralDiscount: false
  };

  const [formData, setFormData] = useState<QuoteFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormData, string>>>({});
  const [subtotal, setSubtotal] = useState(0);
  const [ivaAmount, setIvaAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Calculate totals whenever items, extras, discount, or iva change
  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.extras, formData.discount, formData.iva]);

  const calculateTotals = () => {
    // Items total with per-item discount
    const itemsTotal = formData.items.reduce((total, quoteItem) => {
      const lineSubtotal = (quoteItem.unitPrice * quoteItem.quantity);
      const lineDiscount = Math.max(0, quoteItem.discount || 0);
      return total + Math.max(0, lineSubtotal - lineDiscount);
    }, 0);

    // Extras total with quantity and per-extra discount
    const extrasTotal = formData.extras.reduce((total, extra) => {
      const qty = extra.quantity && extra.quantity > 0 ? extra.quantity : 1;
      const lineSubtotal = extra.price * qty;
      const lineDiscount = Math.max(0, extra.discount || 0);
      return total + Math.max(0, lineSubtotal - lineDiscount);
    }, 0);

    // Subtotal before general discount and IVA
    const baseSubtotal = itemsTotal + extrasTotal;

    // Apply optional general discount
    const generalDiscount = formData.hasGeneralDiscount ? Math.max(0, formData.discount) : 0;
    const discountedSubtotal = Math.max(0, baseSubtotal - generalDiscount);

    // IVA
    const ivaRate = (formData.iva || 0) / 100;
    const ivaValue = discountedSubtotal * ivaRate;
    const newTotal = discountedSubtotal + ivaValue;

    setSubtotal(baseSubtotal);
    setIvaAmount(ivaValue);
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
      description: '',
      // No manual fields by default; user selects an inventory item
    };
    setFormData(prev => ({
      ...prev,
      items: [newQuoteItem, ...prev.items]
    }));
  };

  const addManualQuoteItem = () => {
    const newManualItem: QuoteItem = {
      itemId: '',
      quantity: 1,
      unitPrice: 0,
      description: '',
      // Prefill sensible defaults so a manual hat can be created immediately
      manualName: 'Gorrito básico',
      manualCategory: 'sencillo',
      manualType: 'algodon'
    };
    setFormData(prev => ({
      ...prev,
      items: [newManualItem, ...prev.items]
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

  const convertToManual = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          return {
            itemId: '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            description: item.description || '',
            manualName: '',
            manualCategory: '',
            manualType: ''
          } as QuoteItem;
        }
        return item;
      })
    }));
  };

  // Extras Management
  const addExtra = () => {
    const newExtra: SaleExtra = {
      description: 'Botones',
      price: 0,
      quantity: 1,
      discount: 0
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
      // Validate items based on whether they are manual or from inventory
      const invalidItems = formData.items.filter(item => {
        const isManualEntry = item.manualName !== undefined;
        
        if (isManualEntry) {
          // Validate manual items
          return !item.manualName?.trim() || 
                 !item.manualCategory?.trim() || 
                 !item.manualType?.trim() || 
                 item.quantity <= 0 || 
                 item.unitPrice < 0; // allow 0 for manual default
        } else {
          // Validate inventory items
          return !item.itemId || item.quantity <= 0 || item.unitPrice < 0;
        }
      });
      
      if (invalidItems.length > 0) {
        const hasManualItems = formData.items.some(item => item.manualName !== undefined);
        
        if (hasManualItems) {
          newErrors.items = 'Todos los productos manuales deben tener nombre, categoría, tipo, cantidad mayor a 0 y precio mayor a 0';
        } else {
          newErrors.items = 'Todos los productos deben tener un artículo seleccionado, cantidad mayor a 0 y precio válido';
        }
      }
    }

    // Validate extras
    if (formData.extras.some(extra => extra.price < 0)) {
      newErrors.extras = 'El precio de los extras no puede ser negativo';
    }
    if (formData.extras.some(extra => (extra.quantity ?? 1) <= 0)) {
      newErrors.extras = 'La cantidad de los extras debe ser al menos 1';
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

  // Options to keep manual entry consistent with ItemForm
  const manualCategoryOptions = [
    { value: 'sencillo', label: 'Sencillo' },
    { value: 'doble-vista', label: 'Doble vista' },
    { value: 'completo', label: 'Completo' },
  ];

  const manualTypeOptions = [
    { value: 'algodon', label: 'Algodon' },
    { value: 'normal', label: 'Normal' },
    { value: 'microfibra', label: 'Microfibra' },
    { value: 'microfibra-antifluido', label: 'Microfibra antifluido' },
    { value: 'stretch', label: 'Stretch' },
    { value: 'stretch-antifluido', label: 'Stretch antifluido' },
    { value: 'satin', label: 'Satin' },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="IVA"
              value={String(formData.iva ?? 16)}
              onChange={(value) => handleChange('iva', parseInt(value) as 8 | 16)}
              options={[{ value: '8', label: '8%' }, { value: '16', label: '16%' }]}
              required
              fullWidth
            />
            <Select
              label="Forma de pago"
              value={formData.paymentMethod}
              onChange={(value) => handleChange('paymentMethod', value)}
              options={[
                { value: 'Efectivo', label: 'Efectivo' },
                { value: 'Tarjeta de crédito', label: 'Tarjeta de crédito' },
                { value: 'Transferencia', label: 'Transferencia' },
                { value: 'Deposito', label: 'Depósito' },
              ]}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productos {items.length === 0 && <span className="text-red-500 text-sm font-normal">(No hay productos disponibles)</span>}
            </h3>
            <div className="flex items-center gap-2 gap-y-2 flex-wrap sm:justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={addQuoteItem}
                className="flex items-center justify-center"
                disabled={items.length === 0}
                title={items.length === 0 ? 'Agrega productos al inventario para usar esta opción' : ''}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Producto
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addManualQuoteItem}
                className="flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Producto Manual
              </Button>
            </div>
          </div>

          {items.length === 0 && formData.items.length === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo de entrada manual activado
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      No hay productos en tu inventario. Puedes agregar productos manualmente 
                      para crear la cotización. Los productos se agregarán con la información 
                      que proporciones.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.items.map((quoteItem, index) => {
            const selectedItem = items.find(item => item.id === quoteItem.itemId);
            const itemSubtotal = Math.max(0, (quoteItem.unitPrice * quoteItem.quantity) - (quoteItem.discount || 0));
            const isManualEntry = quoteItem.manualName !== undefined;

            return (
              <div key={index} className={`relative rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                isManualEntry 
                  ? 'bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 border-purple-200 dark:border-purple-700' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700'
              }`}>
                {/* Header with improved styling */}
                <div className="flex justify-between items-center p-4 pb-2">
                  <div className="flex items-center space-x-2">
                    {isManualEntry && <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      Producto {index + 1}
                    </h4>
                    {isManualEntry && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                        <Package className="w-3 h-3 mr-1" />
                        Manual
                      </span>
                    )}
                    {!isManualEntry && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        <Package className="w-3 h-3 mr-1" />
                        Inventario
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuoteItem(index)}
                    className="p-1.5 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors duration-200"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isManualEntry ? (
                  // Enhanced Manual entry form
                  <div className="p-4 pt-0 space-y-6">
                    {/* Product Identity Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300">Información del Producto</h5>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          label="Nombre del Producto"
                          value={quoteItem.manualName || ''}
                          onChange={(e) => updateQuoteItem(index, 'manualName', e.target.value)}
                          placeholder="Ej: Gorrito básico"
                          required
                          fullWidth
                        />

                        <Select
                          label="Categoría"
                          value={quoteItem.manualCategory || ''}
                          onChange={(value) => updateQuoteItem(index, 'manualCategory', value)}
                          options={manualCategoryOptions}
                          required
                          fullWidth
                        />

                        <Select
                          label="Tipo de material"
                          value={quoteItem.manualType || ''}
                          onChange={(value) => updateQuoteItem(index, 'manualType', value)}
                          options={manualTypeOptions}
                          required
                          fullWidth
                        />
                      </div>
                    </div>
                    
                    {/* Pricing & Quantity Section */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          label="Precio unitario ($)"
                          type="number"
                          value={quoteItem.unitPrice === 0 ? '' : quoteItem.unitPrice.toString()}
                          onChange={(e) => updateQuoteItem(index, 'unitPrice', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          required
                          fullWidth
                        />
                        <Input
                          label="Cantidad"
                          type="number"
                          value={quoteItem.quantity === 0 ? '' : quoteItem.quantity.toString()}
                          onChange={(e) => updateQuoteItem(index, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
                          min="1"
                          step="1"
                          placeholder="1"
                          required
                          fullWidth
                        />
                        <Input
                          label="Descuento ($)"
                          type="number"
                          value={quoteItem.discount ? quoteItem.discount.toString() : ''}
                          onChange={(e) => updateQuoteItem(index, 'discount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          fullWidth
                        />
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        <FileTextIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <h5 className="text-sm font-medium text-gray-800 dark:text-gray-300">Descripción Adicional</h5>
                      </div>
                      <textarea
                        value={quoteItem.description || ''}
                        onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                        placeholder="Descripción adicional del producto (opcional)"
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors duration-200"
                      />
                    </div>
                    
                    {/* Enhanced subtotal display */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-green-600 dark:text-green-300" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-200">
                              {quoteItem.manualName || 'Producto sin nombre'}
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-400">
                              {quoteItem.manualCategory || 'Sin categoría'} • {quoteItem.manualType || 'Sin tipo'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-900 dark:text-green-200">
                            ${itemSubtotal.toFixed(2)}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-400">
                            {quoteItem.quantity} × ${quoteItem.unitPrice.toFixed(2)}{(quoteItem.discount || 0) > 0 ? ` − $${(quoteItem.discount || 0).toFixed(2)} desc.` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Existing product selection form
                  <div className="p-4 pt-0 space-y-4">
                    {selectedItem && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{selectedItem.name}</p>
                              <p className="text-xs text-blue-700 dark:text-blue-400">{selectedItem.category} • {selectedItem.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-200">${itemSubtotal.toFixed(2)}</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">{quoteItem.quantity} × ${selectedItem.price.toFixed(2)}{(quoteItem.discount || 0) > 0 ? ` − $${(quoteItem.discount || 0).toFixed(2)} desc.` : ''}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end pr-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => convertToManual(index)}
                      >
                        Usar producto manual
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                      <Input
                        label="Descuento ($)"
                        type="number"
                        value={quoteItem.discount ? quoteItem.discount.toString() : ''}
                        onChange={(e) => updateQuoteItem(index, 'discount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        fullWidth
                      />
                    </div>

                    <Input
                      label="Descripción (Opcional)"
                      value={quoteItem.description || ''}
                      onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                      placeholder="Descripción personalizada del producto"
                      fullWidth
                    />

                    

                    {selectedItem && (
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
                    )}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <Input
                  label="Cantidad"
                  type="number"
                  value={extra.quantity && extra.quantity > 0 ? String(extra.quantity) : '1'}
                  onChange={(e) => updateExtra(index, 'quantity', e.target.value === '' ? 1 : parseInt(e.target.value))}
                  min="1"
                  step="1"
                  fullWidth
                />
                <Input
                  label="Descuento ($)"
                  type="number"
                  value={extra.discount ? String(extra.discount) : ''}
                  onChange={(e) => updateExtra(index, 'discount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
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
            <div className="flex items-center gap-3 mb-3">
              <input
                id="hasGeneralDiscount"
                type="checkbox"
                checked={!!formData.hasGeneralDiscount}
                onChange={(e) => handleChange('hasGeneralDiscount', e.target.checked)}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <label htmlFor="hasGeneralDiscount" className="text-sm text-gray-700 dark:text-gray-300">Aplicar descuento general</label>
            </div>
            <Input
              label="Descuento general ($)"
              type="number"
              value={formData.hasGeneralDiscount && formData.discount > 0 ? formData.discount.toString() : ''}
              onChange={(e) => handleNumberChange('discount', e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={!formData.hasGeneralDiscount}
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
            {formData.hasGeneralDiscount && formData.discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-600 dark:text-red-400">
                  Descuento:
                </span>
                <span className="text-red-600 dark:text-red-400">
                  -${formData.discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-800 dark:text-green-400">
                IVA ({formData.iva || 0}%):
              </span>
              <span className="text-green-800 dark:text-green-400">
                ${ivaAmount.toFixed(2)}
              </span>
            </div>
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
