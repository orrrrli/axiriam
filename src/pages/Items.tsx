import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ItemForm from '../components/inventory/ItemForm';
import ItemDetail from '../components/inventory/ItemDetail';
import Badge from '../components/ui/Badge';
import { Item, ItemFormData } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Trash2, Pencil, Search, PlusCircle, AlertCircle } from 'lucide-react';
import type { TableColumn } from '../components/ui/Table';

const Items: React.FC = () => {
  const { state, addItem, updateItem, deleteItem } = useInventory();
  const { isAuthenticated } = useAuth();
  const { items, rawMaterials, isLoading, error } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddItem = async (data: ItemFormData) => {
    if (!isAuthenticated) {
      setActionError('Debes iniciar sesión para agregar gorros');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    
    try {
      await addItem(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
      setActionError(error instanceof Error ? error.message : 'Error al agregar el gorro');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditItem = async (data: ItemFormData) => {
    if (!currentItem || !isAuthenticated) {
      setActionError('Debes iniciar sesión para editar gorros');
      return;
    }
    
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      await updateItem(currentItem.id, data);
      setIsEditModalOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      setActionError(error instanceof Error ? error.message : 'Error al actualizar el gorro');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentItem || !isAuthenticated) {
      setActionError('Debes iniciar sesión para eliminar gorros');
      return;
    }
    
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      await deleteItem(currentItem.id);
      setIsDeleteModalOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setActionError(error instanceof Error ? error.message : 'Error al eliminar el gorro');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditModal = (item: Item) => {
    setCurrentItem(item);
    setActionError(null);
    setIsEditModalOpen(true);
  };
  
  const openViewModal = (item: Item) => {
    setCurrentItem(item);
    setIsViewModalOpen(true);
  };
  
  const openDeleteModal = (item: Item) => {
    setCurrentItem(item);
    setActionError(null);
    setIsDeleteModalOpen(true);
  };

  const openAddModal = () => {
    setActionError(null);
    setIsAddModalOpen(true);
  };
  
  const columns: TableColumn<Item>[] = [
    {
      header: 'Gorro',
      accessor: 'name',
      className: 'font-medium text-gray-900 dark:text-white'
    },
    {
      header: 'Categoria',
      accessor: (item: Item) => {
        const variant = 
          item.category === 'sencillo' ? 'primary' : 
          item.category === 'doble-vista' ? 'warning' : 
          'secondary';
        
        return (
          <Badge variant={variant}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Badge>
        );
      }
    },
    {
      header: 'Cantidad',
      accessor: 'quantity',
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Precio',
      accessor: (item: Item) => formatCurrency(item.price),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Ultima Actualización',
      accessor: (item: Item) => formatDate(item.updatedAt),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Acciones',
      accessor: (item: Item) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
            className="text-gray-500 hover:text-sky-500 dark:text-gray-400 dark:hover:text-sky-400 transition-colors"
            aria-label="Edit"
            disabled={!isAuthenticated}
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Delete"
            disabled={!isAuthenticated}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  // Show authentication warning if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gorros</h2>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200 mb-2">
            Autenticación Requerida
          </h3>
          <p className="text-amber-700 dark:text-amber-300">
            Debes iniciar sesión para ver y gestionar los gorros.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gorros</h2>
        <Button 
          variant="primary"
          onClick={openAddModal}
          disabled={rawMaterials.length === 0}
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          Agregar nuevo gorro
        </Button>
      </div>

      {/* Show warning if no materials available */}
      {rawMaterials.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-amber-800 dark:text-amber-200">
              No puedes crear gorros sin materiales. Primero agrega algunos materiales en la sección "m² de material".
            </p>
          </div>
        </div>
      )}

      {/* Show global error if any */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar gorros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 sm:text-sm transition-colors duration-200"
        />
      </div>
      
      <Table
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        onRowClick={openViewModal}
        keyExtractor={(item) => item.id}
        emptyMessage="No se encontraron gorros. ¡Agrega tu primer gorro!"
      />
      
      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar nuevo gorro"
        size="lg"
      >
        <div>
          {actionError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{actionError}</p>
            </div>
          )}
          <ItemForm
            onSubmit={handleAddItem}
            onCancel={() => setIsAddModalOpen(false)}
            rawMaterials={rawMaterials}
            isSubmitting={isSubmitting}
          />
        </div>
      </Modal>
      
      {/* Edit Item Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar gorro"
        size="lg"
      >
        {currentItem && (
          <div>
            {actionError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-800 dark:text-red-200 text-sm">{actionError}</p>
              </div>
            )}
            <ItemForm
              initialData={{
                name: currentItem.name,
                category: currentItem.category,
                description: currentItem.description,
                quantity: currentItem.quantity,
                price: currentItem.price,
                materials: currentItem.materials
              }}
              onSubmit={handleEditItem}
              onCancel={() => setIsEditModalOpen(false)}
              rawMaterials={rawMaterials}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </Modal>
      
      {/* View Item Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del gorro"
        size="md"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => { setIsViewModalOpen(false); openEditModal(currentItem!); }}
              disabled={!isAuthenticated}
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
        {currentItem && (
          <ItemDetail
            item={currentItem}
            rawMaterials={rawMaterials}
          />
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Gorro"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ¿Eliminar {currentItem?.name}?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            ¿Estás seguro de que quieres eliminar este gorro? Esta acción no se puede deshacer.
          </p>
          {actionError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{actionError}</p>
            </div>
          )}
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

export default Items;