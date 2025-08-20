import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import OrderMaterialForm from '../components/inventory/OrderMaterialForm';
import OrderMaterialDetail from '../components/inventory/OrderMaterialDetail';
import ShipmentTrackerModal from '../components/inventory/ShipmentTrackerModal';
import Badge from '../components/ui/Badge';
import { OrderMaterial, OrderMaterialFormData } from '../types';
import { formatDate, getStatusBadgeVariant, getStatusLabel } from '../utils/helpers';
import { Trash2, Pencil, Search, PlusCircle, Truck } from 'lucide-react';
import type { TableColumn } from '../components/ui/Table';

const OrderMaterials: React.FC = () => {
  const { state, addOrderMaterial, updateOrderMaterial, deleteOrderMaterial } = useInventory();
  const { orderMaterials, rawMaterials, isLoading } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderMaterial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const filteredOrders = orderMaterials.filter(order => {
    const materialNames = order.materials.flatMap(m => 
      m.designs.map(d => {
        const material = rawMaterials.find(rm => rm.id === d.rawMaterialId);
        return material?.name || '';
      })
    ).join(' ');
    
    return (
      materialNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.distributor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  const handleAddOrder = async (data: OrderMaterialFormData) => {
    setIsSubmitting(true);
    try {
      await addOrderMaterial(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add order:', error);
      alert('Failed to add order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditOrder = async (data: OrderMaterialFormData) => {
    if (!currentOrder) return;
    
    setIsSubmitting(true);
    try {
      await updateOrderMaterial(currentOrder.id, data);
      setIsEditModalOpen(false);
      setCurrentOrder(null);
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentOrder) return;
    
    setIsSubmitting(true);
    try {
      await deleteOrderMaterial(currentOrder.id);
      setIsDeleteModalOpen(false);
      setCurrentOrder(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditModal = (order: OrderMaterial) => {
    setCurrentOrder(order);
    setIsEditModalOpen(true);
  };
  
  const openViewModal = (order: OrderMaterial) => {
    setCurrentOrder(order);
    setIsViewModalOpen(true);
  };
  
  const openDeleteModal = (order: OrderMaterial) => {
    setCurrentOrder(order);
    setIsDeleteModalOpen(true);
  };

  const openTrackerModal = (order: OrderMaterial) => {
    setCurrentOrder(order);
    setIsTrackerModalOpen(true);
  };

  const formatNumber = (value: number, isInteger: boolean = false): string => {
    if (isInteger && Number.isInteger(value)) {
      return value.toString();
    }
    return value.toString();
  };
  
  const columns: TableColumn<OrderMaterial>[] = [
    {
      header: 'Telas',
      accessor: (order: OrderMaterial) => {
        const materialNames = order.materials.flatMap(m => 
          m.designs.map(d => {
            const material = rawMaterials.find(rm => rm.id === d.rawMaterialId);
            return material?.name || 'Material no encontrado';
          })
        );
        const uniqueNames = [...new Set(materialNames)];
        return uniqueNames.length > 1 
          ? `${uniqueNames[0]} (+${uniqueNames.length - 1} más)`
          : uniqueNames[0] || 'Sin materiales';
      },
      className: 'font-medium text-gray-900 dark:text-white'
    },
    {
      header: 'Distribuidor',
      accessor: 'distributor',
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Cantidad',
      accessor: (order: OrderMaterial) => {
        const total = order.materials.reduce((sum, m) => sum + m.quantity, 0);
        return formatNumber(total, true);
      },
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Estado',
      accessor: (order: OrderMaterial) => (
        <Badge variant={getStatusBadgeVariant(order.status)}>
          {getStatusLabel(order.status)}
        </Badge>
      )
    },
    {
      header: 'Paqueteria',
      accessor: (order: OrderMaterial) => (
        <Badge variant={getStatusBadgeVariant(order.status)}>
          {getStatusLabel(order.status)}
        </Badge>
      )
    },
        {
      header: '',
      accessor: (order: OrderMaterial) => (
        <Badge variant={getStatusBadgeVariant(order.status)}>
          {getStatusLabel(order.status)}
        </Badge>
      )
    },
    {
      header: 'Fecha de Creación',
      accessor: (order: OrderMaterial) => formatDate(order.createdAt),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Acciones',
      accessor: (order: OrderMaterial) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); openTrackerModal(order); }}
            className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            aria-label="Track Shipment"
            title="Seguimiento de envío"
          >
            <Truck size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(order); }}
            className="text-gray-500 hover:text-sky-500 dark:text-gray-400 dark:hover:text-sky-400 transition-colors"
            aria-label="Edit"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(order); }}
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pedidos</h2>
        <Button 
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center"
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Agregar Nuevo Material</span>
          <span className="sm:hidden">Nuevo Pedido</span>
        </Button>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar pedidos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 sm:text-sm transition-colors duration-200"
        />
      </div>
      
      <Table
        columns={columns}
        data={filteredOrders}
        isLoading={isLoading}
        onRowClick={openViewModal}
        keyExtractor={(order) => order.id}
        emptyMessage="No hay pedidos. ¡Crea tu primer pedido!"
      />
      
      {/* Add Order Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Nuevo Pedido de Material"
        size="xl"
      >
        <OrderMaterialForm
          onSubmit={handleAddOrder}
          onCancel={() => setIsAddModalOpen(false)}
          rawMaterials={rawMaterials}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* Edit Order Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Pedido"
        size="xl"
      >
        {currentOrder && (
          <OrderMaterialForm
            initialData={{
              materials: currentOrder.materials,
              distributor: currentOrder.distributor,
              description: currentOrder.description,
              status: currentOrder.status,
              trackingNumber: currentOrder.trackingNumber,
              parcel_service: currentOrder.parcel_service
            }}
            onSubmit={handleEditOrder}
            onCancel={() => setIsEditModalOpen(false)}
            rawMaterials={rawMaterials}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
      
      {/* View Order Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Pedido"
        size="lg"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => { setIsViewModalOpen(false); openEditModal(currentOrder!); }}
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
        {currentOrder && (
          <OrderMaterialDetail
            order={currentOrder}
            rawMaterials={rawMaterials}
          />
        )}
      </Modal>

      {/* Shipment Tracker Modal */}
      {currentOrder && (
        <ShipmentTrackerModal
          isOpen={isTrackerModalOpen}
          onClose={() => setIsTrackerModalOpen(false)}
          order={currentOrder}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Pedido"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ¿Eliminar este pedido?
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

export default OrderMaterials;