import React from 'react';
import { Item, RawMaterial } from '../../types';
import { formatCurrency, formatDate, getMaterialsById } from '../../utils/helpers';
import Badge from '../ui/Badge';

interface ItemDetailProps {
  item: Item;
  rawMaterials: RawMaterial[];
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, rawMaterials }) => {
  const usedMaterials = getMaterialsById(item.materials, rawMaterials);
  
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'sencillo':
        return <Badge variant="primary">Sencillo</Badge>;
      case 'doble-vista':
        return <Badge variant="warning">Doble vista</Badge>;
      case 'completo':
        return <Badge variant="secondary">Completo</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  const getTypeMaterialBadge = (type: string) => {
    switch (type) {
      case 'sencillo-algodon':
        return <Badge variant="success">Sencillo algodón</Badge>;
      case 'completo-algodon':
        return <Badge variant="danger">Completo algodón</Badge>;
      case 'stretch':
        return <Badge variant="default">Stretch</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
          <div className='flex items-center space-x-2'>
            {getCategoryBadge(item.category)}
            {getTypeMaterialBadge(item.type)}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Cantidad</span>
          <span className="block mt-1 text-lg font-medium">{item.quantity}</span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Precio</span>
          <span className="block mt-1 text-lg font-medium text-gray-900 dark:text-white">{formatCurrency(item.price)}</span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Materiales usados</h4>
        {usedMaterials.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            {usedMaterials.map(material => (
              <li key={material.id} className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{material.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{material.width}x{material.height}m</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{material.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No se usaron materiales</p>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200 text-sm text-gray-500 dark:border-gray-700">
        <p>Created: {formatDate(item.createdAt)}</p>
        <p>Last Updated: {formatDate(item.updatedAt)}</p>
      </div>
    </div>
  );
};

export default ItemDetail;