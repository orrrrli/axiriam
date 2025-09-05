import React from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

interface SortButtonProps {
  sortOrder: 'asc' | 'desc' | null;
  onSort: (order: 'asc' | 'desc') => void;
  label?: string;
}

const SortButton: React.FC<SortButtonProps> = ({ sortOrder, onSort, label = "Fecha" }) => {
  const handleClick = () => {
    if (sortOrder === null || sortOrder === 'desc') {
      onSort('asc');
    } else {
      onSort('desc');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors h-10"
    >
      <span className="mr-2">{label}</span>
      {sortOrder === 'asc' && <ChevronUp className="w-4 h-4" />}
      {sortOrder === 'desc' && <ChevronDown className="w-4 h-4" />}
      {sortOrder === null && <ArrowUpDown className="w-4 h-4" />}
    </button>
  );
};

export default SortButton;
