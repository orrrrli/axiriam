import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Copy } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  error?: any;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  error,
  onRetry,
  isRetrying = false
}) => {
  const getErrorDetails = () => {
    if (!error) return null;

    // Handle different error types
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.statusText) {
      return `${error.response.status}: ${error.response.statusText}`;
    }

    return JSON.stringify(error, null, 2);
  };

  const errorDetails = getErrorDetails();

  const copyErrorToClipboard = async () => {
    if (!errorDetails) return;
    
    try {
      await navigator.clipboard.writeText(errorDetails);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  const footer = (
    <div className="flex justify-between items-center w-full">
      <div className="flex space-x-3">
        {errorDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={copyErrorToClipboard}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copiar Error
          </Button>
        )}
      </div>
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cerrar
        </Button>
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            isLoading={isRetrying}
          >
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="lg"
    >
      <div className="space-y-4">
        {/* Main Error Message */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {message}
            </p>
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
            💡 Sugerencias:
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Asegúrate de que el elemento no esté siendo usado en otras partes como en ventas, ordenes, etc.</li>
            <li>• Intenta refrescar la página y volver a intentar</li>
            <li>• Si el problema persiste, contacta al soporte técnico</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;
