import React from 'react';

interface ToggleProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {(label || description) && (
        <div className="flex flex-col mr-3">
          {label && (
            <span className={`text-sm font-medium ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}`}>
              {label}
            </span>
          )}
          {description && (
            <span className={`text-xs ${disabled ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'}`}>
              {description}
            </span>
          )}
        </div>
      )}
      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 
          dark:focus:ring-offset-gray-900
          ${checked ? 'bg-sky-600' : 'bg-gray-200 dark:bg-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        disabled={disabled}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};

export default Toggle;
