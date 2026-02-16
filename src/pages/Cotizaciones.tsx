import React, { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import QuoteForm from '../components/inventory/QuoteForm';
import Badge from '../components/ui/Badge';
import SortButton from '../components/ui/SortButton';
import { Quote, QuoteFormData } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { generateQuotePDFFromFormData, generateQuotePDFFromQuote } from '../utils/pdfGenerator';
import { Trash2, Pencil, Search, PlusCircle, FileText, Download } from 'lucide-react';
import type { TableColumn } from '../components/ui/Table';
import apiService from '../services/api';

const Cotizaciones: React.FC = () => {
  const { state } = useInventory();
  const { items, isLoading } = state;
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('desc');
  
  // Helpers: API <-> UI mappers
  const mapApiQuoteToFrontend = (q: any): Quote => {
    const items = (q.quote_items || []).map((it: any) => ({
      itemId: it.item_id || '',
      quantity: Number(it.quantity) || 0,
      unitPrice: Number(it.unit_price) || 0,
      description: it.description || undefined,
      discount: Number(it.discount || 0),
      manualName: it.manual_name || undefined,
      manualCategory: it.manual_category || undefined,
      manualType: it.manual_type || undefined,
    }));
    const extras = (q.quote_extras || []).map((ex: any) => ({
      description: ex.description,
      price: Number(ex.price) || 0,
      quantity: ex.quantity != null ? Number(ex.quantity) : 1,
      discount: Number(ex.discount || 0),
    }));
    const iva = (q.iva ?? 16) as 8 | 16;
    const includingIva = q.including_iva ?? true;
    const paymentMethod = q.payment_method || 'Efectivo';
    return {
      id: String(q.id),
      quoteNumber: q.quote_number || 'COT',
      clientName: q.client_name,
      clientEmail: q.client_email || undefined,
      clientPhone: q.client_phone || undefined,
      clientCompany: q.client_company || undefined,
      status: q.status || 'draft',
      validUntil: new Date(q.valid_until),
      items,
      extras,
      subtotal: Number(q.subtotal) || 0,
      discount: Number(q.discount) || 0,
      totalAmount: Number(q.total_amount) || 0,
      notes: q.notes || undefined,
      iva,
      includingIva,
      paymentMethod,
      createdAt: new Date(q.created_at || Date.now()),
      updatedAt: new Date(q.updated_at || Date.now()),
    };
  };

  const mapFormToApiPayload = (data: QuoteFormData) => ({
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    clientCompany: data.clientCompany,
    validUntil: data.validUntil,
    discount: data.hasGeneralDiscount ? data.discount : 0,
    notes: data.notes,
    iva: data.iva,
    including_iva: !!data.includingIva,
    items: data.items.map((it) => ({
      itemId: it.manualName ? undefined : it.itemId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      description: it.description,
      discount: it.discount || 0,
      manualName: it.manualName,
      manualCategory: it.manualCategory,
      manualType: it.manualType,
    })),
    extras: data.extras.map((ex) => ({
      description: ex.description,
      price: ex.price,
      quantity: ex.quantity ?? 1,
      discount: ex.discount || 0,
    })),
  });

  // Initial fetch (get all)
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await apiService.getQuotes();
        const mapped = (data || []).map(mapApiQuoteToFrontend);
        setQuotes(mapped);
      } catch (e) {
        console.error('Failed to fetch quotes:', e);
      }
    };
    fetchQuotes();
  }, []);
  
  const filteredQuotes = quotes.filter(quote => 
    quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (quote.clientCompany && quote.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    // Always sort by date, default to newest first
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const generateQuoteNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `COT-${year}${month}${day}-${random}`;
  };

  const calculateTotals = (formData: QuoteFormData) => {
    const itemsTotal = formData.items.reduce((total, item) => {
      const lineSubtotal = item.unitPrice * item.quantity;
      const lineDiscount = Math.max(0, item.discount || 0);
      return total + Math.max(0, lineSubtotal - lineDiscount);
    }, 0);

    const extrasTotal = formData.extras.reduce((total, extra) => {
      const qty = extra.quantity && extra.quantity > 0 ? extra.quantity : 1;
      const lineSubtotal = extra.price * qty;
      const lineDiscount = Math.max(0, extra.discount || 0);
      return total + Math.max(0, lineSubtotal - lineDiscount);
    }, 0);

    const baseSubtotal = itemsTotal + extrasTotal;
    const generalDiscount = formData.hasGeneralDiscount ? Math.max(0, formData.discount) : 0;
    const discountedSubtotal = Math.max(0, baseSubtotal - generalDiscount);
    const ivaRate = (formData.iva || 0) / 100;
    const ivaAmount = formData.includingIva ? 0 : (discountedSubtotal * ivaRate);
    const totalAmount = formData.includingIva ? discountedSubtotal : (discountedSubtotal + ivaAmount);

    return {
      subtotal: baseSubtotal,
      totalAmount
    };
  };
  
  const handleAddQuote = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      const payload = mapFormToApiPayload(data);
      const created = await apiService.createQuote(payload);
      const mapped = mapApiQuoteToFrontend(created);
      // Preserve client-side fields not yet persisted by backend (iva, paymentMethod)
      mapped.iva = data.iva;
      mapped.paymentMethod = data.paymentMethod;
      // Recompute total with IVA to keep UI consistent
      const totals = calculateTotals(data);
      mapped.subtotal = totals.subtotal;
      mapped.totalAmount = totals.totalAmount;
      setQuotes(prev => [mapped, ...prev]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add quote:', error);
      alert('Failed to add quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditQuote = async (data: QuoteFormData) => {
    if (!currentQuote) return;
    
    setIsSubmitting(true);
    try {
      const payload = mapFormToApiPayload(data);
      const updated = await apiService.updateQuote(currentQuote.id, payload);
      let mapped = mapApiQuoteToFrontend(updated);
      // Preserve client-side fields
      mapped = { ...mapped, iva: data.iva, paymentMethod: data.paymentMethod };
      const totals = calculateTotals(data);
      mapped.subtotal = totals.subtotal;
      mapped.totalAmount = totals.totalAmount;
      setQuotes(prev => prev.map(q => q.id === currentQuote.id ? mapped : q));
      setIsEditModalOpen(false);
      setCurrentQuote(null);
    } catch (error) {
      console.error('Failed to update quote:', error);
      alert('Failed to update quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentQuote) return;
    
    setIsSubmitting(true);
    try {
      await apiService.deleteQuote(currentQuote.id);
      setQuotes(prev => prev.filter(quote => quote.id !== currentQuote.id));
      setIsDeleteModalOpen(false);
      setCurrentQuote(null);
    } catch (error) {
      console.error('Failed to delete quote:', error);
      alert('Failed to delete quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePDF = async (data: QuoteFormData) => {
    try {
      const quoteNumber = generateQuoteNumber();
      generateQuotePDFFromFormData(data, items, quoteNumber);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor intenta de nuevo.');
    }
  };

  const handleDownloadPDF = (quote: Quote) => {
    try {
      generateQuotePDFFromQuote(quote, items);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el PDF. Por favor intenta de nuevo.');
    }
  };
  
  const openEditModal = async (quote: Quote) => {
    try {
      // Fetch latest from API (get one)
      const fresh = await apiService.getQuote(quote.id);
      const mapped = mapApiQuoteToFrontend(fresh);
      // Preserve UI-only fields if backend lacks them
      mapped.iva = mapped.iva ?? quote.iva;
      mapped.paymentMethod = mapped.paymentMethod ?? quote.paymentMethod;
      setCurrentQuote(mapped);
    } catch (e) {
      console.warn('Falling back to local quote for edit:', e);
      setCurrentQuote(quote);
    }
    setIsEditModalOpen(true);
  };
  
  const openViewModal = async (quote: Quote) => {
    try {
      const fresh = await apiService.getQuote(quote.id);
      const mapped = mapApiQuoteToFrontend(fresh);
      mapped.iva = mapped.iva ?? quote.iva;
      mapped.paymentMethod = mapped.paymentMethod ?? quote.paymentMethod;
      setCurrentQuote(mapped);
    } catch (e) {
      console.warn('Falling back to local quote for view:', e);
      setCurrentQuote(quote);
    }
    setIsViewModalOpen(true);
  };
  
  const openDeleteModal = (quote: Quote) => {
    setCurrentQuote(quote);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (order: 'asc' | 'desc') => {
    setSortOrder(order);
  };

  const getStatusBadgeVariant = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'primary';
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'expired': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviada';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'expired': return 'Expirada';
      default: return status;
    }
  };
  
  const columns: TableColumn<Quote>[] = [
    {
      header: 'Número',
      accessor: 'quoteNumber',
      className: 'font-medium text-gray-900 dark:text-white'
    },
    {
      header: 'Cliente',
      accessor: (quote: Quote) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{quote.clientName}</div>
          {quote.clientCompany && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{quote.clientCompany}</div>
          )}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (quote: Quote) => (
        <Badge variant={getStatusBadgeVariant(quote.status)}>
          {getStatusLabel(quote.status)}
        </Badge>
      )
    },
    {
      header: 'Monto',
      accessor: (quote: Quote) => formatCurrency(quote.totalAmount),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Válida hasta',
      accessor: (quote: Quote) => formatDate(quote.validUntil),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Fecha',
      accessor: (quote: Quote) => formatDate(quote.createdAt),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Acciones',
      accessor: (quote: Quote) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); handleDownloadPDF(quote); }}
            className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
            aria-label="Download PDF"
          >
            <Download size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(quote); }}
            className="text-gray-500 hover:text-sky-500 dark:text-gray-400 dark:hover:text-sky-400 transition-colors"
            aria-label="Edit"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(quote); }}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      className: 'text-right',
      sticky: 'right'
    }
  ];

  const QuoteDetail: React.FC<{ quote: Quote }> = ({ quote }) => (
    <div className="space-y-6">
      {/* Client Information */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Información del Cliente</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Nombre:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{quote.clientName}</span>
          </div>
          {quote.clientCompany && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Empresa:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{quote.clientCompany}</span>
            </div>
          )}
          {quote.clientEmail && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{quote.clientEmail}</span>
            </div>
          )}
          {quote.clientPhone && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Teléfono:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{quote.clientPhone}</span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Forma de pago:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{quote.paymentMethod}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">IVA:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{quote.iva}%</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">IVA incluido:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {quote.includingIva ? 'Sí' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Quote Items */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Productos</h4>
        <div className="space-y-2">
          {quote.items.map((quoteItem, index) => {
            const item = quoteItem.manualName ? null : items.find(i => i.id === quoteItem.itemId);
            return (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {quoteItem.manualName ? quoteItem.manualName : (item?.name || 'Producto no encontrado')}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {quoteItem.manualName
                      ? `${quoteItem.manualCategory || 'Sin categoría'} • ${quoteItem.manualType || 'Sin tipo'}`
                      : item ? `${item.category} • ${item.type}` : ''}
                  </div>
                  {quoteItem.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">{quoteItem.description}</div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Cantidad: {quoteItem.quantity} × ${quoteItem.unitPrice}
                    {quoteItem.discount && quoteItem.discount > 0 && (
                      <span> • Descuento: -${quoteItem.discount}</span>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.max(0, quoteItem.quantity * quoteItem.unitPrice - (quoteItem.discount || 0)).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extras */}
      {quote.extras.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Extras</h4>
          <div className="space-y-2">
            {quote.extras.map((extra, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="text-gray-900 dark:text-white">
                  <div className="font-medium">{extra.description}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Cantidad: {extra.quantity ?? 1} × ${extra.price}
                    {extra.discount && extra.discount > 0 && (
                      <span> • Descuento: -${extra.discount}</span>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.max(0, (extra.price * (extra.quantity ?? 1)) - (extra.discount || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-700">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-green-800 dark:text-green-400">Subtotal:</span>
            <span className="text-green-800 dark:text-green-400">${quote.subtotal.toFixed(2)}</span>
          </div>
          {quote.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-red-600 dark:text-red-400">Descuento:</span>
              <span className="text-red-600 dark:text-red-400">-${quote.discount.toFixed(2)}</span>
            </div>
          )}
          {/* IVA */}
          {quote.includingIva ? (
            <div className="flex justify-between text-sm">
              <span className="text-green-800 dark:text-green-400">IVA ({quote.iva}%) incluido.</span>
              <span className="text-green-800 dark:text-green-400">$0.00</span>
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-green-800 dark:text-green-400">IVA ({quote.iva}%):</span>
              <span className="text-green-800 dark:text-green-400">
                {(() => {
                  const ivaAmount = (Math.max(0, quote.subtotal - (quote.discount || 0)) * (quote.iva || 0)) / 100;
                  return `$${ivaAmount.toFixed(2)}`;
                })()}
              </span>
            </div>
          )}
          <hr className="border-green-300 dark:border-green-600" />
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-green-900 dark:text-green-300">Total:</span>
            <span className="text-xl font-bold text-green-900 dark:text-green-200">
              {(() => {
                const base = Math.max(0, quote.subtotal - (quote.discount || 0));
                if (quote.includingIva) return `$${base.toFixed(2)}`;
                const ivaAmount = (base * (quote.iva || 0)) / 100;
                return `$${(base + ivaAmount).toFixed(2)}`;
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Notas</h4>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{quote.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cotizaciones</h2>
        <Button 
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center"
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Nueva Cotización</span>
          <span className="sm:hidden">Nueva Cotización</span>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-auto">
          <SortButton
            sortOrder={sortOrder}
            onSort={handleSort}
            label="Ordenar por fecha"
          />
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cotizaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 sm:text-sm transition-colors duration-200 h-10"
          />
        </div>
      </div>
      
      <Table
        columns={columns}
        data={filteredQuotes}
        isLoading={isLoading}
        onRowClick={openViewModal}
        keyExtractor={(quote) => quote.id}
        emptyMessage="No hay cotizaciones. ¡Crea tu primera cotización!"
      />
      
      {/* Add Quote Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Nueva Cotización"
        size="xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                // Get form element and trigger PDF generation
                const formElement = document.querySelector('#add-quote-form') as HTMLFormElement;
                if (formElement) {
                  // The form will handle the actual data collection
                  handleGeneratePDF({} as QuoteFormData);
                }
              }}
              disabled={isSubmitting}
            >
              <FileText className="w-4 h-4 mr-1" />
              Generar PDF
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              onClick={() => {
                const form = document.querySelector('#add-quote-form') as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              }}
            >
              Crear Cotización
            </Button>
          </div>
        }
      >
        <div id="quote-form-container">
          <QuoteForm
            onSubmit={handleAddQuote}
            onCancel={() => setIsAddModalOpen(false)}
            onGeneratePDF={handleGeneratePDF}
            items={items}
            isSubmitting={isSubmitting}
            hideButtons={true}
          />
        </div>
      </Modal>
      
      {/* Edit Quote Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Cotización"
        size="xl"
      >
        {currentQuote && (
          <QuoteForm
            initialData={{
              clientName: currentQuote.clientName,
              clientEmail: currentQuote.clientEmail,
              clientPhone: currentQuote.clientPhone,
              clientCompany: currentQuote.clientCompany,
              validUntil: currentQuote.validUntil,
              items: currentQuote.items,
              extras: currentQuote.extras,
              discount: currentQuote.discount,
              notes: currentQuote.notes,
              iva: currentQuote.iva,
              includingIva: currentQuote.includingIva,
              paymentMethod: currentQuote.paymentMethod,
              hasGeneralDiscount: (currentQuote.discount || 0) > 0
            }}
            onSubmit={handleEditQuote}
            onCancel={() => setIsEditModalOpen(false)}
            onGeneratePDF={handleGeneratePDF}
            items={items}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
      
      {/* View Quote Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de la Cotización"
        size="lg"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => currentQuote && handleDownloadPDF(currentQuote)}
            >
              <FileText className="w-4 h-4 mr-1" />
              Descargar PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { setIsViewModalOpen(false); openEditModal(currentQuote!); }}
            >
              Editar
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setIsViewModalOpen(false)}
            >
              Cerrar
            </Button>
          </>
        }
      >
        {currentQuote && <QuoteDetail quote={currentQuote} />}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Cotización"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ¿Eliminar cotización {currentQuote?.quoteNumber}?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={isSubmitting}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cotizaciones;
