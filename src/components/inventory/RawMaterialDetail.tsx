import React from 'react';
import { RawMaterial, Item } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Badge from '../ui/Badge';

interface RawMaterialDetailProps {
  material: RawMaterial;
  items: Item[];
}

const RawMaterialDetail: React.FC<RawMaterialDetailProps> = ({ material, items }) => {
  // Find items that use this raw material
  const relatedItems = items.filter(item => item.materials.includes(material.id));
  const totalArea = material.width * material.height;

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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{material.name}</h3>
          <Badge>{formatNumber(material.quantity, material.unit === 'piezas')} {material.unit}</Badge>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{material.description}</p>
      </div>

      {/* Display image if available */}
      {material.imageUrl && (
        <div className="flex justify-center">
          <img
            src={material.imageUrl}
            alt={material.name}
            className="w-48 h-48 object-cover rounded-md border border-gray-300 dark:border-gray-600"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Ancho</span>
          <span className="block mt-1 text-lg font-medium text-gray-900 dark:text-white">
            {formatNumber(material.width)} m
          </span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Alto</span>
          <span className="block mt-1 text-lg font-medium text-gray-900 dark:text-white">
            {formatNumber(material.height)} m
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Cantidad</span>
          <span className="block mt-1 text-lg font-medium text-gray-900 dark:text-white">
            {formatNumber(material.quantity, material.unit === 'piezas')} {material.unit}
          </span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Área Total</span>
          <span className="block mt-1 text-lg font-medium text-gray-900 dark:text-white">{formatNumber(totalArea)} m²</span>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
        <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Costo</span>
        <span className="block mt-1 font-medium text-gray-900 dark:text-white">{formatCurrency(material.price)}</span>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
        <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Proveedor</span>
        <span className="block mt-1 font-medium text-gray-900 dark:text-white">{material.supplier || 'Not specified'}</span>
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Usado para las piezas</h4>
        {relatedItems.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            {relatedItems.map(item => (
              <li key={item.id} className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                  <Badge 
                    variant={
                      item.category === 'sencillo' 
                        ? 'primary' 
                        : item.category === 'doble-vista' 
                          ? 'warning' 
                          : item.category === 'completo'
                            ? 'secondary'
                            : item.category === 'sencillo-algodon'
                              ? 'success'
                              : item.category === 'completo-algodon'
                                ? 'danger'
                                : 'default'
                    }
                  >
                    {item.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No es usado en ninguna pieza. </p>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <p>Created: {formatDate(material.createdAt)}</p>
        <p>Last Updated: {formatDate(material.updatedAt)}</p>
      </div>
    </div>
  );
};

export default RawMaterialDetail;