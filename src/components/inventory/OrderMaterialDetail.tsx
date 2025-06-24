import React from 'react';
import { OrderMaterial, RawMaterial } from '../../types';
import { formatDate, getStatusLabel } from '../../utils/helpers';
import Badge from '../ui/Badge';

interface OrderMaterialDetailProps {
  order: OrderMaterial;
  rawMaterials: RawMaterial[];
}

const OrderMaterialDetail: React.FC<OrderMaterialDetailProps> = ({ order, rawMaterials }) => {
  const material = rawMaterials.find(m => m.id === order.rawMaterialId);
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'ordered':
        return 'primary';
      case 'received':
        return 'success';
      default:
        return 'default';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Pedido de {material?.name || 'Material no encontrado'}
          </h3>
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{order.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Cantidad</span>
          <span className="block mt-1 text-lg font-medium">{order.quantity} m²</span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Distribuidor</span>
          <span className="block mt-1 text-lg font-medium text-gray-900 dark:text-white">{order.distributor}</span>
        </div>
      </div>
      
      {material && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Detalles del Material</h4>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{material.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{material.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Proveedor actual: {material.supplier}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Stock: {material.quantity} {material.unit}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <p>Creado: {formatDate(order.createdAt)}</p>
        <p>Última actualización: {formatDate(order.updatedAt)}</p>
      </div>
    </div>
  );
};

export default OrderMaterialDetail;