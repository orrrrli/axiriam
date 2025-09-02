import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  onClear?: () => void;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  error,
  fullWidth = false,
  className,
  id,
  value,
  onClear,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
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

  const hasValue = value && formatDateForInput(value as Date | string) !== '';

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking the clear button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Focus the input to open the date picker
    if (inputRef.current && !props.disabled) {
      inputRef.current.focus();
      inputRef.current.showPicker?.(); // Modern browsers support this method
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (props.onChange) {
      // Create a synthetic event for clearing
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      props.onChange(syntheticEvent);
    }
  };
  
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={`
            block text-sm font-medium mb-2 transition-colors duration-200
            ${isFocused 
              ? 'text-sky-600 dark:text-sky-400' 
              : error 
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-700 dark:text-gray-300'
            }
          `}
        >
          {label}
        </label>
      )}
      
      <div 
        className="relative group cursor-pointer" 
        onClick={handleContainerClick}
      >
        {/* Calendar Icon */}
        <div className={`
          absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none
          transition-colors duration-200 z-10
          ${isFocused 
            ? 'text-sky-500 dark:text-sky-400' 
            : error 
              ? 'text-red-500 dark:text-red-400'
              : 'text-gray-400 dark:text-gray-500'
          }
        `}>
          <Calendar className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="date"
          value={formatDateForInput(value as Date | string)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            pl-10 pr-10 py-3 bg-white dark:bg-gray-900 
            border-2 shadow-sm transition-all duration-200
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none block w-full rounded-lg text-sm
            text-gray-900 dark:text-gray-100
            disabled:bg-gray-100 dark:disabled:bg-gray-800
            disabled:cursor-not-allowed disabled:opacity-50
            hover:shadow-md focus:shadow-lg
            transform hover:scale-[1.01] focus:scale-[1.01]
            cursor-pointer
            [&::-webkit-calendar-picker-indicator]:opacity-0
            [&::-webkit-calendar-picker-indicator]:absolute
            [&::-webkit-calendar-picker-indicator]:right-0
            [&::-webkit-calendar-picker-indicator]:w-full
            [&::-webkit-calendar-picker-indicator]:h-full
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            ${error 
              ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500' 
              : isFocused
                ? 'border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20 dark:ring-sky-400/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${className || ''}
          `}
          {...props}
        />

        {/* Clear Button */}
        {hasValue && !props.disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2
              p-1 rounded-full transition-all duration-200
              hover:bg-gray-100 dark:hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-sky-500/20
              text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
              opacity-0 group-hover:opacity-100 focus:opacity-100
            `}
            aria-label="Clear date"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Animated Border Glow */}
        <div className={`
          absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-200
          ${isFocused && !error 
            ? 'bg-gradient-to-r from-sky-500/10 to-blue-500/10 opacity-100' 
            : 'opacity-0'
          }
        `} />
      </div>

      {/* Error Message with Animation */}
      {error && (
        <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
            <span className="w-1 h-1 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            {error}
          </p>
        </div>
      )}

      {/* Helper Text */}
      {!error && hasValue && (
        <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(formatDateForInput(value as Date | string)).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateInput;