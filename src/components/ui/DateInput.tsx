import React from 'react';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  error,
  fullWidth = false,
  className,
  id,
  value,
  ...props
}) => {
  const inputId = id || `date-input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Convert Date to string format for input
  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    // Format as YYYY-MM-DD for input[type="date"]
    return dateObj.toISOString().split('T')[0];
  };
  
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="date"
        value={formatDateForInput(value as Date | string)}
        className={`
          px-3 py-2 bg-white dark:bg-gray-900 
          border shadow-sm border-gray-300 dark:border-gray-600 
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:border-sky-500 focus:ring-sky-500 
          block w-full rounded-md sm:text-sm focus:ring-1 
          text-gray-900 dark:text-gray-100
          disabled:bg-gray-100 dark:disabled:bg-gray-800
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-500 dark:border-red-500' : ''}
          ${className || ''}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default DateInput;