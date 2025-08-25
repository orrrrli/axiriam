import React from 'react';
import { Sale, Item } from '../../types';
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/helpers';
import Badge from '../ui/Badge';

interface SaleDetailProps {
  sale: Sale;
  items: Item[];
}


const SaleDetail: React.FC<SaleDetailProps> = ({ sale, items }) => {
    console.log('🔍 SaleDetail - Datos recibidos:');
    console.log('📋 Sale objeto completo:', JSON.stringify(sale, null, 2));
    console.log('🛍️ Items array:', JSON.stringify(items, null, 2));
    
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

  // Calculate totals
  const itemsTotal = sale.saleItems?.reduce((total, saleItem) => {
    const item = items.find(item => item.id === saleItem.itemId);
    return total + (item ? item.price * saleItem.quantity : 0);
  }, 0) || 0;

  const extrasTotal = sale.extras?.reduce((total, extra) => {
    return total + extra.price;
  }, 0) || 0;
  
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
        {sale.saleItems && sale.saleItems.length > 0 ? (
          <div className="space-y-2">
            {sale.saleItems.map((saleItem, index) => {
              const item = items.find(item => item.id === saleItem.itemId);
              const subtotal = item ? item.price * saleItem.quantity : 0;
              
              return (
                <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item?.name || 'Artículo no encontrado'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item?.description || 'Sin descripción'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(item?.price || 0)} × {saleItem.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Subtotal Artículos:
                </span>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                  {formatCurrency(itemsTotal)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No se especificaron artículos</p>
        )}
      </div>

      {/* Extras Section */}
      {sale.extras && sale.extras.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Extras</h4>
          <div className="space-y-2">
            {sale.extras.map((extra, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {extra.description}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(extra.price)}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-200 dark:border-purple-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                  Subtotal Extras:
                </span>
                <span className="text-sm font-bold text-purple-900 dark:text-purple-200">
                  {formatCurrency(extrasTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Total Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-700">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-900 dark:text-green-300">
              Total de la Venta:
            </span>
            <span className="text-xl font-bold text-green-900 dark:text-green-200">
              {formatCurrency(sale.totalAmount)}
            </span>
          </div>
          {(itemsTotal + extrasTotal !== sale.totalAmount) && (
            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
              * El total puede incluir ajustes adicionales
            </p>
          )}
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <p>Creado: {formatDate(sale.createdAt)}</p>
        <p>Última actualización: {formatDate(sale.updatedAt)}</p>
      </div>
    </div>
  );
};

export default SaleDetail;