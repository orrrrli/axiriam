import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency, getLowStockItems, formatDate } from '../utils/helpers';
import { BarChart3, PackageSearch, ShoppingBag, AlertCircle, ScissorsSquare, Stethoscope, HandHeart} from 'lucide-react';

const LOW_STOCK_THRESHOLD = 5;

const Dashboard: React.FC = () => {
  const { state } = useInventory();
  const { items, rawMaterials, isLoading } = state;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }
  
  // Calculate dashboard metrics
  const totalItems = items.length;
  const totalMaterials = rawMaterials.length;
  const lowStockItems = getLowStockItems(LOW_STOCK_THRESHOLD, items);
  const lowStockMaterials = getLowStockItems(LOW_STOCK_THRESHOLD, rawMaterials);
  
  const totalItemsValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalMaterialsValue = rawMaterials.reduce((sum, material) => sum + (material.price * material.quantity), 0);
  
  // Create data for category distribution
  const categoryCounts = items.reduce((acc, item) => {
    const { category } = item;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-sky-500">
          <div className="flex items-center">
            <div className="bg-sky-100 dark:bg-sky-900 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-sky-500 dark:text-sky-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Gorros</h3>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">{totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-emerald-500">
          <div className="flex items-center">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-lg">
              <PackageSearch className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400"> Total m² de material </h3>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">{totalMaterials}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor de Inventario</h3>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">{formatCurrency(totalItemsValue + totalMaterialsValue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-amber-500">
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Bajo</h3>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">{lowStockItems + lowStockMaterials}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Categorias de gorros</h3>
          
          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([category, count]) => {
              const percentage = Math.round((count / totalItems) * 100);
              let barColor;
              
              switch (category) {
                case 'sencillo':
                  barColor = 'bg-sky-500';
                  break;
                case 'doble-vista':
                  barColor = 'bg-amber-500';
                  break;
                case 'completo-ajustable':
                  barColor = 'bg-purple-500';
                  break;
                default:
                  barColor = 'bg-gray-500';
              }
              
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">{category}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`${barColor} h-2.5 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alertas de Stock Bajo</h3>
          
          {(lowStockItems === 0 && lowStockMaterials === 0) ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>All items and materials are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.filter(item => item.quantity <= LOW_STOCK_THRESHOLD).map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Solo {item.quantity} en stock</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
                    Gorro
                  </span>
                </div>
              ))}
              
              {rawMaterials.filter(material => material.quantity <= LOW_STOCK_THRESHOLD).map(material => (
                <div key={material.id} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{material.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Solo {material.quantity} {material.unit} en stock
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                    m² 
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Actividad Reciente</h3>
        
        <div className="space-y-4">
          {[...items, ...rawMaterials]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5)
            .map(item => {
              const isRawMaterial = 'unit' in item;
              
              return (
                <div key={item.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <div className={`p-2 rounded-full ${isRawMaterial ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-sky-100 dark:bg-sky-900'} mr-3`}>
                    {isRawMaterial ? (
                      <ScissorsSquare className={`h-5 w-5 ${isRawMaterial ? 'text-emerald-500 dark:text-emerald-400' : 'text-sky-500 dark:text-sky-400'}`} />
                    ) : (
                      <HandHeart className={`h-5 w-5 ${isRawMaterial ? 'text-emerald-500 dark:text-emerald-400' : 'text-sky-500 dark:text-sky-400'}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated on {formatDate(item.updatedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;