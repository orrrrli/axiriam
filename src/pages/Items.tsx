import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ItemForm from '../components/inventory/ItemForm';
import ItemDetail from '../components/inventory/ItemDetail';
import Badge from '../components/ui/Badge';
import { Item, ItemFormData } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Trash2, Pencil, Search, PlusCircle } from 'lucide-react';
import type { TableColumn } from '../components/ui/Table'; // Ajusta la ruta si es diferente

const Items: React.FC = () => {
  const { state, addItem, updateItem, deleteItem } = useInventory();
  const { items, rawMaterials, isLoading } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddItem = (data: ItemFormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      addItem(data);
      setIsAddModalOpen(false);
      setIsSubmitting(false);
    }, 500);
  };
  
  const handleEditItem = (data: ItemFormData) => {
    if (!currentItem) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      updateItem(currentItem.id, data);
      setIsEditModalOpen(false);
      setCurrentItem(null);
      setIsSubmitting(false);
    }, 500);
  };
  
  const handleDeleteConfirm = () => {
    if (!currentItem) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      deleteItem(currentItem.id);
      setIsDeleteModalOpen(false);
      setCurrentItem(null);
      setIsSubmitting(false);
    }, 500);
  };
  
  const openEditModal = (item: Item) => {
    setCurrentItem(item);
    setIsEditModalOpen(true);
  };
  
  const openViewModal = (item: Item) => {
    setCurrentItem(item);
    setIsViewModalOpen(true);
  };
  
  const openDeleteModal = (item: Item) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
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
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }}
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gorros</h2>
        <Button 
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          Agregar nuevo gorro
        </Button>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search items..."
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
        emptyMessage="No items found. Add your first item!"
      />
      
      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar nuevo gorro"
        size="lg"
      >
        <ItemForm
          onSubmit={handleAddItem}
          onCancel={() => setIsAddModalOpen(false)}
          rawMaterials={rawMaterials}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* Edit Item Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar gorro"
        size="lg"
      >
        {currentItem && (
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
            >
              Edit
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
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
        title="Delete Item"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete {currentItem?.name}?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={isSubmitting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Items;