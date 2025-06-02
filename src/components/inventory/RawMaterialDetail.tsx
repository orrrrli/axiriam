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
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{material.name}</h3>
          <Badge>{material.unit}</Badge>
        </div>
        <p className="text-sm text-gray-500">{material.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <span className="block text-xs text-gray-500 uppercase">Cantidad</span>
          <span className="block mt-1 text-lg font-medium">
            {material.quantity} {material.unit}
          </span>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <span className="block text-xs text-gray-500 uppercase">Costo</span>
          <span className="block mt-1 text-lg font-medium">{formatCurrency(material.price)}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md">
        <span className="block text-xs text-gray-500 uppercase">Proveedor</span>
        <span className="block mt-1 font-medium">{material.supplier || 'Not specified'}</span>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Usado para las piezas</h4>
        {relatedItems.length > 0 ? (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
            {relatedItems.map(item => (
              <li key={item.id} className="p-3 bg-white hover:bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <Badge 
                    variant={
                      item.category === 'sencillo' 
                        ? 'primary' 
                        : item.category === 'doble-vista' 
                          ? 'warning' 
                          : 'secondary'
                    }
                  >
                    {item.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No es usado en ninguna pieza. </p>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
        <p>Created: {formatDate(material.createdAt)}</p>
        <p>Last Updated: {formatDate(material.updatedAt)}</p>
      </div>
    </div>
  );
};

export default RawMaterialDetail;