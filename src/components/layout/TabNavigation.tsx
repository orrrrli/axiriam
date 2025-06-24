import React from 'react';
import { PackageOpen, Box, LayoutDashboard } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { id: 'items', label: 'Gorros', icon: <Box className="w-5 h-5 mr-2" /> },
    { id: 'raw-materials', label: 'Materiales', icon: <PackageOpen className="w-5 h-5 mr-2" /> }
  ];

  return (
    <div className="bg-white dark:bg-background-dark shadow transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`
                flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark hover:border-secondary-light dark:hover:border-secondary-dark'}
                transition-colors duration-200
              `}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;