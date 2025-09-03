import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
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
  const [typeFilter, setTypeFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const filteredAndSortedMaterials = (() => {
    let filtered = rawMaterials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === '' || material.type === typeFilter;
      
      return matchesSearch && matchesType;
    });

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

  // Functions for TYPE badges (matching Items.tsx pattern)
  const getRawMaterialTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'algodon':
        return 'success';
      case 'stretch':
        return 'warning';
      case 'normal':
        return 'danger';
      case 'satin':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRawMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'algodon':
        return 'Algodon';
      case 'stretch':
        return 'Stretch';
      case 'normal':
        return 'Normal';
      case 'satin':
        return 'Satin';
      default:
        return type;
    }
  };

  const isRawMaterialType = (type: string) => {
    return ['algodon', 'stretch', 'normal', 'satin'].includes(type);
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
      header: 'Tipo',
      accessor: (material: RawMaterial) => {
        if (isRawMaterialType(material.type)) {
          const variant = getRawMaterialTypeBadgeVariant(material.type);
          return (
            <Badge variant={variant}>
              {getRawMaterialTypeLabel(material.type)}
            </Badge>
          );
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      }
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
            title="Editar material"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(material); }}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Delete"
            title="Eliminar material"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      className: 'text-center'
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
        <div className="w-full sm:w-64">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filtrar por tipo de material
          </label>
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: '', label: 'Todos los tipos' },
              { value: 'algodon', label: 'Algodon' },
              { value: 'normal', label: 'Normal' },
              { value: 'stretch', label: 'Stretch' },
              { value: 'satin', label: 'Satin' }
            ]}
            fullWidth
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ordenar
          </label>
          <SortButton
            sortOrder={sortOrder}
            onSort={handleSort}
            label="Ordenar por fecha"
          />
        </div>
        
        <div className="relative flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar materiales..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-colors duration-200"
            />
          </div>
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
              type: currentMaterial.type,
              width: currentMaterial.width,
              height: currentMaterial.height,
              quantity: currentMaterial.quantity,
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