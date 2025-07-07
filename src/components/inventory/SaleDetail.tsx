import React from 'react';
import { Sale, Item } from '../../types';
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/helpers';
import Badge from '../ui/Badge';

interface SaleDetailProps {
  sale: Sale;
  items: Item[];
}

const SaleDetail: React.FC<SaleDetailProps> = ({ sale, items }) => {
  const soldItems = items.filter(item => sale.items.includes(item.id));
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSocialMediaDisplay = () => {
    const platform = sale.socialMediaPlatform.charAt(0).toUpperCase() + sale.socialMediaPlatform.slice(1);
    return `${platform}: ${sale.socialMediaUsername}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Venta para {sale.name}
          </h3>
          <Badge variant={getStatusBadgeVariant(sale.status)}>
            {getStatusLabel(sale.status)}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {sale.saleId}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Monto Total</span>
          <span className="block mt-1 text-lg font-medium">{formatCurrency(sale.totalAmount)}</span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Red Social</span>
          <span className="block mt-1 text-lg font-medium text-gray-900 dark:text-white">
            {getSocialMediaDisplay()}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Factura</span>
          <span className="block mt-1 text-sm font-medium text-gray-900 dark:text-white">
            {sale.invoiceRequired ? 'Requerida' : 'No requerida'}
          </span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Tipo de Envío</span>
          <span className="block mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
            {sale.shippingType}
          </span>
        </div>
      </div>
      
      {sale.trackingNumber && (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Número de Rastreo</span>
          <span className="block mt-1 font-medium text-gray-900 dark:text-white">{sale.trackingNumber}</span>
        </div>
      )}
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Detalles de Envío</h4>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
          {sale.shippingType === 'local' ? (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Envío Local - {sale.localShippingOption === 'meeting-point' ? 'Punto de encuentro' : 'PZ Express'}
              </p>
              {sale.localAddress && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Dirección: {sale.localAddress}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Envío Nacional - {sale.nationalShippingCarrier?.toUpperCase()}
              </p>
              {sale.shippingDescription && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {sale.shippingDescription}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Artículos Vendidos</h4>
        {soldItems.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            {soldItems.map(item => (
              <li key={item.id} className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.price)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No se especificaron artículos</p>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <p>Creado: {formatDate(sale.createdAt)}</p>
        <p>Última actualización: {formatDate(sale.updatedAt)}</p>
      </div>
    </div>
  );
};

export default SaleDetail;