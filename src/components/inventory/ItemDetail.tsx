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
      case 'instruments':
        return <Badge variant="primary">Sencillo</Badge>;
      case 'consumables':
        return <Badge variant="warning">Doble-vista</Badge>;
      case 'equipment':
        return <Badge variant="secondary">Completo-ajustable</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
          {getCategoryBadge(item.category)}
        </div>
        <p className="text-sm text-gray-500">{item.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <span className="block text-xs text-gray-500 uppercase">Cantidad</span>
          <span className="block mt-1 text-lg font-medium">{item.quantity}</span>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <span className="block text-xs text-gray-500 uppercase">Precio</span>
          <span className="block mt-1 text-lg font-medium">{formatCurrency(item.price)}</span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Materiales usados</h4>
        {usedMaterials.length > 0 ? (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
            {usedMaterials.map(material => (
              <li key={material.id} className="p-3 bg-white hover:bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{material.name}</span>
                  <span className="text-sm text-gray-500">{material.unit}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{material.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No raw materials used</p>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
        <p>Created: {formatDate(item.createdAt)}</p>
        <p>Last Updated: {formatDate(item.updatedAt)}</p>
      </div>
    </div>
  );
};

export default ItemDetail;