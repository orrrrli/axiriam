import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[];
  error?: string;
  fullWidth?: boolean;
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  fullWidth = false,
  value,
  onChange,
  className,
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          block w-full px-3 py-2 bg-white dark:bg-gray-700 
          border border-gray-300 dark:border-gray-600 
          rounded-lg shadow-sm text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
          sm:text-sm h-10
          ${error ? 'border-red-500 dark:border-red-500' : ''}
          ${className || ''}
        `}
        {...props}
      >
        {value === undefined && <option value="" disabled>Selecciona una opción</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Select;