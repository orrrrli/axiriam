import React from 'react';

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sticky?: 'left' | 'right';
}

export type { TableColumn };


interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

function Table<T>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  keyExtractor,
  emptyMessage = 'No data available'
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }
  
  const getStickyClasses = (column: TableColumn<T>) => {
    if (!column.sticky) return '';
    
    const baseClasses = 'sticky z-10';
    const shadowClasses = column.sticky === 'right' 
      ? 'shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] dark:shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.3)]'
      : 'shadow-[8px_0_8px_-8px_rgba(0,0,0,0.1)] dark:shadow-[8px_0_8px_-8px_rgba(0,0,0,0.3)]';
    
    return `${baseClasses} ${column.sticky}-0 ${shadowClasses} bg-gray-50 dark:bg-gray-800`;
  };

  const getStickyBodyClasses = (column: TableColumn<T>) => {
    if (!column.sticky) return '';
    
    const baseClasses = 'sticky z-10';
    const shadowClasses = column.sticky === 'right' 
      ? 'shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] dark:shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.3)]'
      : 'shadow-[8px_0_8px_-8px_rgba(0,0,0,0.1)] dark:shadow-[8px_0_8px_-8px_rgba(0,0,0,0.3)]';
    
    return `${baseClasses} ${column.sticky}-0 ${shadowClasses} bg-white dark:bg-gray-900`;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-lg font-medium text-gray-700 dark:text-gray-400 tracking-wider ${column.className || ''} ${getStickyClasses(column)}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
            >
              {columns.map((column, index) => {
                const cellContent = typeof column.accessor === 'function'
                  ? column.accessor(row)
                  : row[column.accessor as keyof T];
                
                return (
                  <td 
                    key={index}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${column.className || ''} ${getStickyBodyClasses(column)}`}
                  >
                    {cellContent as React.ReactNode}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;