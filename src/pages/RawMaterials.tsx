import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import RawMaterialForm from '../components/inventory/RawMaterialForm';
import RawMaterialDetail from '../components/inventory/RawMaterialDetail';
import { RawMaterial, RawMaterialFormData } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Trash2, Pencil, Search, PlusCircle, AlertCircle } from 'lucide-react';
import { unitRawMaterial } from '../types';
import type { TableColumn } from '../components/ui/Table';

const RawMaterials: React.FC = () => {
  const { state, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useInventory();
  const { isAuthenticated } = useAuth();
  const { rawMaterials, items, isLoading, error } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<RawMaterial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  const filteredMaterials = rawMaterials.filter(material => 
    material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddMaterial = async (data: RawMaterialFormData) => {
    if (!isAuthenticated) {
      setActionError('Debes iniciar sesión para agregar materiales');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    
    try {
      await addRawMaterial(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding material:', error);
      setActionError(error instanceof Error ? error.message : 'Error al agregar el material');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditMaterial = async (data: RawMaterialFormData) => {
    if (!currentMaterial || !isAuthenticated) {
      setActionError('Debes iniciar sesión para editar materiales');
      return;
    }
    
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      await updateRawMaterial(currentMaterial.id, data);
      setIsEditModalOpen(false);
      setCurrentMaterial(null);
    } catch (error) {
      console.error('Error updating material:', error);
      setActionError(error instanceof Error ? error.message : 'Error al actualizar el material');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentMaterial || !isAuthenticated) {
      setActionError('Debes iniciar sesión para eliminar materiales');
      return;
    }
    
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      await deleteRawMaterial(currentMaterial.id);
      setIsDeleteModalOpen(false);
      setCurrentMaterial(null);
    } catch (error) {
      console.error('Error deleting material:', error);
      setActionError(error instanceof Error ? error.message : 'Error al eliminar el material');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditModal = (material: RawMaterial) => {
    setCurrentMaterial(material);
    setActionError(null);
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
      setActionError('Este material no se puede eliminar porque está siendo usado en uno o más gorros.');
      return;
    }
    
    setCurrentMaterial(material);
    setActionError(null);
    setIsDeleteModalOpen(true);
  };

  const openAddModal = () => {
    setActionError(null);
    setIsAddModalOpen(true);
  };
  
  const columns: TableColumn<RawMaterial>[] = [
    {
      header: 'Nombre',
      accessor: 'name',
      className: 'font-medium text-gray-900 dark:text-white'
    },
    {
      header: `Cantidad (${unitRawMaterial[0].toLowerCase()})`,
      accessor: (material: RawMaterial) => `${material.quantity}`,
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
            disabled={!isAuthenticated}
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(material); }}
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Materiales</h2>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200 mb-2">
            Autenticación Requerida
          </h3>
          <p className="text-amber-700 dark:text-amber-300">
            Debes iniciar sesión para ver y gestionar los materiales.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Materiales</h2>
        <Button 
          variant="primary"
          onClick={openAddModal}
        >
          <PlusCircle className="w-5 h-5 mr-1" />
          Agregar Nuevo Material
        </Button>
      </div>

      {/* Show global error if any */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Show action error if any */}
      {actionError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800 dark:text-red-200">{actionError}</p>
          </div>
        </div>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar materiales..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 sm:text-sm transition-colors duration-200"
        />
      </div>
      
      <Table
        columns={columns}
        data={filteredMaterials}
        isLoading={isLoading}
        onRowClick={openViewModal}
        keyExtractor={(material) => material.id}
        emptyMessage="No se encontraron materiales. ¡Agrega tu primer material!"
      />
      
      {/* Add Material Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Nuevo Material"
        size="lg"
      >
        <div>
          {actionError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{actionError}</p>
            </div>
          )}
          <RawMaterialForm
            onSubmit={handleAddMaterial}
            onCancel={() => setIsAddModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </Modal>
      
      {/* Edit Material Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Material"
        size="lg"
      >
        {currentMaterial && (
          <div>
            {actionError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-800 dark:text-red-200 text-sm">{actionError}</p>
              </div>
            )}
            <RawMaterialForm
              initialData={{
                name: currentMaterial.name,
                description: currentMaterial.description,
                quantity: currentMaterial.quantity,
                unit: currentMaterial.unit,
                price: currentMaterial.price,
                supplier: currentMaterial.supplier
              }}
              onSubmit={handleEditMaterial}
              onCancel={() => setIsEditModalOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
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
        title="Eliminar Material"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ¿Eliminar {currentMaterial?.name}?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            ¿Estás seguro de que quieres eliminar este material? Esta acción no se puede deshacer.
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

export default RawMaterials;