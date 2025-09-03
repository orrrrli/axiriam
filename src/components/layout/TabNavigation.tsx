import React from 'react';
import { PackageOpen, Box, LayoutDashboard, ShoppingCart, DollarSign, FileText } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { id: 'items', label: 'Gorros', icon: <Box className="w-5 h-5 mr-2" /> },
    { id: 'raw-materials', label: 'Diseños/Material', icon: <PackageOpen className="w-5 h-5 mr-2" /> },
    { id: 'order-materials', label: 'Pedidos', icon: <ShoppingCart className="w-5 h-5 mr-2" /> },
    { id: 'sales', label: 'Ventas', icon: <DollarSign className="w-5 h-5 mr-2" /> },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: <FileText className="w-5 h-5 mr-2" /> }
  ];

  return (
    <div className="bg-white dark:bg-background-dark shadow transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Scrollable container for mobile */}
        <div className="overflow-x-auto scrollbar-hide">
          <nav className="flex space-x-8 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`
                  flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm min-w-0 flex-shrink-0
                  ${activeTab === tab.id
                    ? 'border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark hover:border-secondary-light dark:hover:border-secondary-dark'}
                  transition-colors duration-200
                `}
                onClick={() => onTabChange(tab.id)}
              >
                <span className="hidden sm:inline">{tab.icon}</span>
                <span className="sm:hidden mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;