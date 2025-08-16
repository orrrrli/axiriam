import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ItemForm from '../components/inventory/ItemForm';
import ItemDetail from '../components/inventory/ItemDetail';
import ReduceQuantityModal from '../components/inventory/ReduceQuantityModal';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import { Item, ItemFormData } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Trash2, Pencil, Search, PlusCircle, MinusCircle } from 'lucide-react';
import type { TableColumn } from '../components/ui/Table';

const LOW_STOCK_THRESHOLD = 10;

const Items: React.FC = () => {
  const { state, addItem, updateItem, deleteItem, reduceItemQuantity } = useInventory();
  const { items, rawMaterials, isLoading } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReduceModalOpen, setIsReduceModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;

    const matchesType = typeFilter === '' || item.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });
  
  const handleAddItem = async (data: ItemFormData) => {
    setIsSubmitting(true);
    try {
      await addItem(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditItem = async (data: ItemFormData) => {
    if (!currentItem) return;
    
    setIsSubmitting(true);
    try {
      await updateItem(currentItem.id, data);
      setIsEditModalOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    
    setIsSubmitting(true);
    try {
      await deleteItem(currentItem.id);
      setIsDeleteModalOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReduceConfirm = async (quantity: number) => {
    if (!currentItem) return;
    
    setIsSubmitting(true);
    try {
      await reduceItemQuantity(currentItem.id, quantity);
      setIsReduceModalOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error('Failed to reduce item quantity:', error);
      alert('Failed to reduce item quantity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  const openReduceModal = (item: Item) => {
    if (item.quantity <= 0) {
      alert('No hay stock disponible para este artículo.');
      return;
    }
    setCurrentItem(item);
    setIsReduceModalOpen(true);
  };

   // Funciones para TIPO
  const getTypeBadgeVariant = (category: string) => {
    switch (category) {
      case 'sencillo':
        return 'primary';
      case 'doble-vista':
        return 'warning';
      case 'completo':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (category: string) => {
    switch (category) {
      case 'sencillo':
        return 'Sencillo';
      case 'doble-vista':
        return 'Doble vista';
      case 'completo':
        return 'Completo';
      default:
        return category;
    }
  };

  // Funciones para MATERIAL
  const getMaterialBadgeVariant = (type: string) => {
    switch (type) {
      case 'sencillo-algodon':
        return 'success';
      case 'completo-algodon':
        return 'danger';
      case 'stretch':
        return 'default';
      default:
        return 'default';
    }
  };

  const getMaterialLabel = (type: string) => {
    switch (type) {
      case 'sencillo-algodon':
        return 'Sencillo algodón';
      case 'completo-algodon':
        return 'Completo algodón';
      case 'stretch':
        return 'Stretch';
      default:
        return type;
    }
  };

  const isTypeCategory = (category: string) => {
    return ['sencillo', 'doble-vista', 'completo'].includes(category);
  };

  const isMaterialCategory = (type: string) => {
    return ['sencillo-algodon', 'completo-algodon', 'stretch'].includes(type);
  };
  
  const columns: TableColumn<Item>[] = [
    {
      header: 'Gorro',
      accessor: 'name',
      className: 'font-medium text-gray-900 dark:text-white'
    },
    {
    header: 'Tipo',
      accessor: (item: Item) => {
        if (isTypeCategory(item.category)) {
          const variant = getTypeBadgeVariant(item.category);
          return (
            <Badge variant={variant}>
              {getTypeLabel(item.category)}
            </Badge>
          );
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      }
    },
    {
      header: 'Material',
      accessor: (item: Item) => {
        if (isMaterialCategory(item.type)) {
          const variant = getMaterialBadgeVariant(item.type);
          return (
            <Badge variant={variant}>
              {getMaterialLabel(item.type)}
            </Badge>
          );
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      }
    },
    {
      header: 'Cantidad',
      accessor: (item: Item) => (
        <span className={item.quantity <= LOW_STOCK_THRESHOLD ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
          {item.quantity}
        </span>
      ),
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
            onClick={(e) => { e.stopPropagation(); openReduceModal(item); }}
            className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
            aria-label="Reduce Stock"
            title="Reducir stock"
          >
            <MinusCircle size={18} />
          </button>
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

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    { value: 'sencillo', label: 'Sencillo' },
    { value: 'doble-vista', label: 'Doble vista' },
    { value: 'completo', label: 'Completo' },
  ];

  const typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'sencillo-algodon', label: 'Sencillo algodón' },
    { value: 'completo-algodon', label: 'Completo algodón' },
    { value: 'stretch', label: 'Stretch' }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gorros</h2>
        <Button 
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center"
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Agregar Nuevo Gorro</span>
          <span className="sm:hidden">Agregar</span>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-64">
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            fullWidth
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            fullWidth
          />
        </div>
        
        <div className="relative flex-1">
          <div className="absolute left-0 w-10 h-10 grid place-items-center pointer-events-none z-10">
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
              type: currentItem.type,
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

      {/* Reduce Quantity Modal */}
      {currentItem && (
        <ReduceQuantityModal
          isOpen={isReduceModalOpen}
          onClose={() => setIsReduceModalOpen(false)}
          item={currentItem}
          onConfirm={handleReduceConfirm}
          isSubmitting={isSubmitting}
        />
      )}
      
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