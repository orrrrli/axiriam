import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import RawMaterialForm from '../components/inventory/RawMaterialForm';
import RawMaterialDetail from '../components/inventory/RawMaterialDetail';
import { RawMaterial, RawMaterialFormData } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Trash2, Pencil, Search, PlusCircle } from 'lucide-react';
import SortButton from '../components/ui/SortButton';
import type { TableColumn } from '../components/ui/Table';

const LOW_STOCK_THRESHOLD = 3;

const RawMaterials: React.FC = () => {
  const { state, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useInventory();
  const { rawMaterials, items, isLoading } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<RawMaterial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const filteredAndSortedMaterials = (() => {
    let filtered = rawMaterials.filter(material => 
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    return filtered;
  })();

  const handleSort = (order: 'asc' | 'desc') => {
    setSortOrder(order);
  };

  const handleAddMaterial = async (data: RawMaterialFormData) => {
    setIsSubmitting(true);
    try {
      await addRawMaterial(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add material:', error);
      alert('Failed to add material. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditMaterial = async (data: RawMaterialFormData) => {
    if (!currentMaterial) return;
    
    setIsSubmitting(true);
    try {
      await updateRawMaterial(currentMaterial.id, data);
      setIsEditModalOpen(false);
      setCurrentMaterial(null);
    } catch (error) {
      console.error('Failed to update material:', error);
      alert('Failed to update material. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentMaterial) return;
    
    setIsSubmitting(true);
    try {
      await deleteRawMaterial(currentMaterial.id);
      setIsDeleteModalOpen(false);
      setCurrentMaterial(null);
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('Failed to delete material. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditModal = (material: RawMaterial) => {
    setCurrentMaterial(material);
    setIsEditModalOpen(true);
  };
  
  const openViewModal = (material: RawMaterial) => {
    setCurrentMaterial(material);
    setIsViewModalOpen(true);
  };
  
  const openDeleteModal = (material: RawMaterial) => {
    // Check if this material is used in any items
    const isUsed = items.some(item => item.materials.includes(material.id));
    
    if (isUsed) {
      alert('This material cannot be deleted because it is used in one or more items.');
      return;
    }
    
    setCurrentMaterial(material);
    setIsDeleteModalOpen(true);
  };

  const formatNumber = (value: number, isInteger: boolean = false): string => {
    if (isInteger && Number.isInteger(value)) {
      return value.toString();
    }
    return value.toString();
  };
  
  const columns: TableColumn<RawMaterial>[] = [
    {
      header: 'Imagen',
      accessor: (material: RawMaterial) => (
        material.imageUrl ? (
          <img
            src={material.imageUrl}
            alt={material.name}
            className="w-12 h-12 object-cover rounded-md border border-gray-300 dark:border-gray-600"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Sin imagen</span>
          </div>
        )
      ),
      className: 'text-center'
    },
    {
      header: 'Nombre',
      accessor: 'name',
      className: 'font-medium text-gray-900 dark:text-white'
    },
    {
      header: 'Dimensiones',
      accessor: (material: RawMaterial) => `${formatNumber(material.width)} x ${formatNumber(material.height)} m`,
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Cantidad',
      accessor: (material: RawMaterial) => {
        const isLowStock = material.quantity <= LOW_STOCK_THRESHOLD;
        
        return (
          <span className={isLowStock ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
            {formatNumber(material.quantity)}
          </span>
        );
      },
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Costo',
      accessor: (material: RawMaterial) => formatCurrency(material.price),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Proveedor',
      accessor: 'supplier',
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Ultima Actualización',
      accessor: (material: RawMaterial) => formatDate(material.updatedAt),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      header: 'Acciones',
      accessor: (material: RawMaterial) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(material); }}
            className="text-gray-500 hover:text-sky-500 dark:text-gray-400 dark:hover:text-sky-400 transition-colors"
            aria-label="Edit"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(material); }}
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Diseños/Material</h2>
        <Button 
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center"
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Agregar Nuevo Material</span>
          <span className="sm:hidden">Agregar</span>
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
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 sm:text-sm transition-colors duration-200"
          />
        </div>
      </div>
      
      <Table
        columns={columns}
        data={filteredAndSortedMaterials}
        isLoading={isLoading}
        onRowClick={openViewModal}
        keyExtractor={(material) => material.id}
        emptyMessage="No raw materials found. Add your first material!"
      />
      
      {/* Add Material Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Nuevo Material"
        size="lg"
      >
        <RawMaterialForm
          onSubmit={handleAddMaterial}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* Edit Material Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Raw Material"
        size="lg"
      >
        {currentMaterial && (
          <RawMaterialForm
            initialData={{
              name: currentMaterial.name,
              description: currentMaterial.description,
              width: currentMaterial.width,
              height: currentMaterial.height,
              quantity: currentMaterial.quantity,
              unit: currentMaterial.unit,
              price: currentMaterial.price,
              supplier: currentMaterial.supplier,
              imageUrl: currentMaterial.imageUrl
            }}
            onSubmit={handleEditMaterial}
            onCancel={() => setIsEditModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
      
      {/* View Material Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalle del Material"
        size="md"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => { setIsViewModalOpen(false); openEditModal(currentMaterial!); }}
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
        {currentMaterial && (
          <RawMaterialDetail
            material={currentMaterial}
            items={items}
          />
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Raw Material"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete {currentMaterial?.name}?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to delete this material? This action cannot be undone.
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

export default RawMaterials;