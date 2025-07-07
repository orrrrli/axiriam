import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { apiService } from '../services/api';
import { BarChart3, PackageSearch, ShoppingCart, AlertCircle, ScissorsSquare, Stethoscope, HandHeart, Clock} from 'lucide-react';

const LOW_STOCK_THRESHOLD_ITEMS = 10;
const LOW_STOCK_THRESHOLD_MATERIALS = 3;

const Dashboard: React.FC = () => {
  const { state } = useInventory();
  const { isLoading } = state;
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [categoryDistribution, setCategoryDistribution] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [lowStockData, setLowStockData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        
        const [stats, distribution, activity, lowStock] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getCategoryDistribution(),
          apiService.getRecentActivity(5),
          apiService.getLowStockData(LOW_STOCK_THRESHOLD_ITEMS, LOW_STOCK_THRESHOLD_MATERIALS)
        ]);

        setDashboardData(stats);
        setCategoryDistribution(distribution);
        setRecentActivity(activity);
        setLowStockData(lowStock);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadDashboardData();
  }, []);
  
  if (isLoading || loadingDashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const formatNumber = (value: number, isInteger: boolean = false): string => {
    if (isInteger && Number.isInteger(value)) {
      return value.toString();
    }
    return value.toString();
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-sky-500">
          <div className="flex items-center">
            <div className="bg-sky-100 dark:bg-sky-900 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-sky-500 dark:text-sky-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pedidos Pendientes</h3>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                {dashboardData?.alerts?.pendingOrders || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-emerald-500">
          <div className="flex items-center">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-lg">
              <PackageSearch className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Diseños</h3>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                {dashboardData?.totals?.designs || 0}
              </p>
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
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                {dashboardData?.alerts?.totalLowStock || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Categorias de gorros</h3>
          
          <div className="space-y-4">
            {Object.entries(categoryDistribution).map(([category, count]) => {
              const totalItems = Object.values(categoryDistribution).reduce((sum: number, val: any) => sum + val, 0);
              const percentage = totalItems > 0 ? Math.round((count as number / totalItems) * 100) : 0;
              let barColor;
              
              switch (category) {
                case 'sencillo':
                  barColor = 'bg-sky-500';
                  break;
                case 'doble-vista':
                  barColor = 'bg-amber-500';
                  break;
                case 'completo':
                  barColor = 'bg-purple-500';
                  break;
                case 'sencillo-algodon':
                  barColor = 'bg-green-500';
                  break;
                case 'completo-algodon':
                  barColor = 'bg-red-500';
                  break;
                case 'stretch':
                  barColor = 'bg-indigo-500';
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
          
          {(!lowStockData?.items?.length && !lowStockData?.materials?.length) ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>¡Todos los artículos y materiales tienen buen stock!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockData?.items?.map((item: any) => (
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
              
              {lowStockData?.materials?.map((material: any) => (
                <div key={material.id} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{material.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Solo {formatNumber(material.quantity, material.unit === 'piezas')} {material.unit} en stock
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                    Material
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
          {recentActivity.map((activity, index) => {
            const getIcon = (type: string) => {
              switch (type) {
                case 'item':
                  return <HandHeart className="h-5 w-5 text-sky-500 dark:text-sky-400" />;
                case 'material':
                  return <ScissorsSquare className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
                case 'order':
                  return <ShoppingCart className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
                case 'sale':
                  return <Stethoscope className="h-5 w-5 text-green-500 dark:text-green-400" />;
                default:
                  return <PackageSearch className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
              }
            };

            const getBgColor = (type: string) => {
              switch (type) {
                case 'item':
                  return 'bg-sky-100 dark:bg-sky-900';
                case 'material':
                  return 'bg-emerald-100 dark:bg-emerald-900';
                case 'order':
                  return 'bg-purple-100 dark:bg-purple-900';
                case 'sale':
                  return 'bg-green-100 dark:bg-green-900';
                default:
                  return 'bg-gray-100 dark:bg-gray-700';
              }
            };

            return (
              <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <div className={`p-2 rounded-full ${getBgColor(activity.type)} mr-3`}>
                  {getIcon(activity.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.subtitle} • {formatDate(new Date(activity.timestamp))}
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