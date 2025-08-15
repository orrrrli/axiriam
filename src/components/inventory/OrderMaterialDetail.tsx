import React from 'react';
import { OrderMaterial, RawMaterial } from '../../types';
import { formatDate, getStatusLabel } from '../../utils/helpers';
import Badge from '../ui/Badge';

interface OrderMaterialDetailProps {
  order: OrderMaterial;
  rawMaterials: RawMaterial[];
}

const OrderMaterialDetail: React.FC<OrderMaterialDetailProps> = ({ order, rawMaterials }) => {
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
  
  const getTotalQuantity = () => {
    return order.materials.reduce((total, material) => {
      return total + material.quantity;
    }, 0);
  };

  const formatNumber = (value: number, isInteger: boolean = false): string => {
    if (isInteger && Number.isInteger(value)) {
      return value.toString();
    }
    return value.toString();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Pedido de Materiales
          </h3>
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{order.description}</p>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Paquetería</span>
          <span className="block mt-1 text-lg font-medium text-gray-900 dark:text-white">
            {order.parcel_service || 'No disponible'}
          </span>
        </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Cantidad Total</span>
          <span className="block mt-1 text-lg font-medium">{formatNumber(getTotalQuantity(), true)}</span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Distribuidor</span>
          <span className="block mt-1 text-lg font-medium text-gray-900 dark:text-white">{order.distributor}</span>
        </div>
        
      </div>
      
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Materiales Solicitados</h4>
        <div className="space-y-3">
          {order.materials.map((materialGroup, materialIndex) => (
            <div key={materialIndex} className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                  Grupo de Material {materialIndex + 1}
                </h5>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Cantidad: {formatNumber(materialGroup.quantity, true)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {materialGroup.designs.map((design, designIndex) => {
                  const material = rawMaterials.find(m => m.id === design.rawMaterialId);
                  const totalArea = parseFloat((design.height * design.width).toFixed(3));
                  return (
                    <div key={designIndex} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {material?.name || 'Material no encontrado'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {material?.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatNumber(totalArea)} m²
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                        <div className="text-center">
                          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Alto</span>
                          <span className="block mt-1 text-sm font-medium text-gray-900 dark:text-white">
                            {formatNumber(design.height)}m
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Ancho</span>
                          <span className="block mt-1 text-sm font-medium text-gray-900 dark:text-white">
                            {formatNumber(design.width)}m
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Área</span>
                          <span className="block mt-1 text-sm font-medium text-gray-900 dark:text-white">
                            {formatNumber(totalArea)}m²
                          </span>
                        </div>
                      </div>
                      
                      {material && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Proveedor actual: {material.supplier} | Stock disponible: {formatNumber(material.quantity, material.unit === 'piezas')} {material.unit}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <p>Creado: {formatDate(order.createdAt)}</p>
        <p>Última actualización: {formatDate(order.updatedAt)}</p>
      </div>
    </div>
  );
};

export default OrderMaterialDetail;