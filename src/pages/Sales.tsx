import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SaleForm from '../components/inventory/SaleForm';
import SaleDetail from '../components/inventory/SaleDetail';
import Badge from '../components/ui/Badge';
import { Sale, SaleFormData } from '../types';
import { formatCurrency, formatDate, getStatusBadgeVariant, getStatusLabel } from '../utils/helpers';
import { Trash2, Pencil, Search, PlusCircle } from 'lucide-react';
import type { TableColumn } from '../components/ui/Table';

const Sales: React.FC = () => {
  const { state, addSale, updateSale, deleteSale } = useInventory();
  const { sales, items, isLoading } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const filteredSales = sales.filter(sale => 
    sale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.socialMediaUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.saleId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddSale = async (data: SaleFormData) => {
    setIsSubmitting(true);
    try {
      await addSale(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add sale:', error);
      alert('Failed to add sale. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditSale = async (data: SaleFormData) => {
    if (!currentSale) return;
    
    setIsSubmitting(true);
    try {
      await updateSale(currentSale.id, data);
      setIsEditModalOpen(false);
      setCurrentSale(null);
    } catch (error) {
      console.error('Failed to update sale:', error);
      alert('Failed to update sale. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentSale) return;
    
    setIsSubmitting(true);
    try {
      await deleteSale(currentSale.id);
      setIsDeleteModalOpen(false);
      setCurrentSale(null);
    } catch (error) {
      console.error('Failed to delete sale:', error);
      alert('Failed to delete sale. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditModal = (sale: Sale) => {
    setCurrentSale(sale);
    setIsEditModalOpen(true);
  };
  
  const openViewModal = (sale: Sale) => {
    setCurrentSale(sale);
    setIsViewModalOpen(true);
  };
  
  const openDeleteModal = (sale: Sale) => {
    setCurrentSale(sale);
    setIsDeleteModalOpen(true);
  };
  
  const columns: TableColumn<Sale>[] = [
    {
      header: 'Cliente',
      accessor: 'name',
      className: 'font-medium text-gray-900 dark:text-white'
    },
    {
      header: 'ID Venta',
      accessor: 'saleId',
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Estado',
      accessor: (sale: Sale) => (
        <Badge variant={getStatusBadgeVariant(sale.status)}>
          {getStatusLabel(sale.status)}
        </Badge>
      )
    },
    {
      header: 'Red Social',
      accessor: (sale: Sale) => (
        <span className="capitalize">
          {sale.socialMediaPlatform}
        </span>
      ),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Monto',
      accessor: (sale: Sale) => formatCurrency(sale.totalAmount),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Tipo de Envío',
      accessor: (sale: Sale) => (
        <span className="capitalize">{sale.shippingType}</span>
      ),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Fecha',
      accessor: (sale: Sale) => formatDate(sale.createdAt),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Acciones',
      accessor: (sale: Sale) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(sale); }}
            className="text-gray-500 hover:text-sky-500 dark:text-gray-400 dark:hover:text-sky-400 transition-colors"
            aria-label="Edit"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(sale); }}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ventas</h2>
        <Button 
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center"
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Nueva Venta</span>
          <span className="sm:hidden">Nueva Venta</span>
        </Button>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar ventas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 sm:text-sm transition-colors duration-200"
        />
      </div>
      
      <Table
        columns={columns}
        data={filteredSales}
        isLoading={isLoading}
        onRowClick={openViewModal}
        keyExtractor={(sale) => sale.id}
        emptyMessage="No hay ventas. ¡Registra tu primera venta!"
      />
      
      {/* Add Sale Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Nueva Venta"
        size="xl"
            items: currentSale.items,
            saleItems: currentSale.saleItems || [],
            extras: currentSale.extras || []
        <SaleForm
          onSubmit={handleAddSale}
          onCancel={() => setIsAddModalOpen(false)}
          items={items}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* Edit Sale Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Venta"
        size="xl"
      >
        {currentSale && (
          <SaleForm
            initialData={{
              name: currentSale.name,
              status: currentSale.status,
              socialMediaPlatform: currentSale.socialMediaPlatform,
              socialMediaUsername: currentSale.socialMediaUsername,
              trackingNumber: currentSale.trackingNumber,
              invoiceRequired: currentSale.invoiceRequired,
              shippingType: currentSale.shippingType,
              localShippingOption: currentSale.localShippingOption,
              localAddress: currentSale.localAddress,
              nationalShippingCarrier: currentSale.nationalShippingCarrier,
              shippingDescription: currentSale.shippingDescription,
              totalAmount: currentSale.totalAmount,
              items: currentSale.items
            }}
            onSubmit={handleEditSale}
            onCancel={() => setIsEditModalOpen(false)}
            items={items}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
      
      {/* View Sale Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de la Venta"
        size="lg"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => { setIsViewModalOpen(false); openEditModal(currentSale!); }}
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
        {currentSale && (
          <SaleDetail
            sale={currentSale}
            items={items}
          />
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Venta"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ¿Eliminar venta de {currentSale?.name}?
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

export default Sales;