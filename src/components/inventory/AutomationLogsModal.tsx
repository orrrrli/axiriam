import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { formatDate } from '../../utils/helpers';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Activity, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react';

interface AutomationLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: string;
  tableName?: string;
}

const AutomationLogsModal: React.FC<AutomationLogsModalProps> = ({
  isOpen,
  onClose,
  recordId,
  tableName
}) => {
  const { getAutomationLogs } = useInventory();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, recordId, tableName]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tableNames = tableName ? [tableName] : undefined;
      const result = await getAutomationLogs(tableNames, recordId, 100);
      setLogs(result);
    } catch (err) {
      console.error('Failed to fetch automation logs:', err);
      setError('Error al cargar los registros de automatización');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('error')) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (action.includes('auto')) {
      return <Activity className="h-4 w-4 text-blue-500" />;
    }
    if (action.includes('create')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Database className="h-4 w-4 text-gray-500" />;
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('error')) return 'danger';
    if (action.includes('auto')) return 'primary';
    if (action.includes('create')) return 'success';
    return 'default';
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'status_auto_update_tracking': 'Estado actualizado (tracking)',
      'status_auto_update_delivered': 'Estado actualizado (entregado)',
      'inventory_auto_update': 'Inventario actualizado',
      'inventory_auto_create': 'Material creado',
      'order_processed_received': 'Pedido procesado',
      'order_processing_error': 'Error procesando pedido',
      'delivery_status_check_error': 'Error verificando entrega'
    };
    
    return labels[action] || action.replace(/_/g, ' ');
  };

  const getTableLabel = (table: string) => {
    const labels: { [key: string]: string } = {
      'order_materials': 'Pedidos',
      'raw_materials': 'Materiales',
      'sales': 'Ventas',
      'items': 'Gorros'
    };
    
    return labels[table] || table;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro de Automatización"
      size="xl"
    >
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Cargando registros...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {!isLoading && !error && logs.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No se encontraron registros de automatización
          </div>
        )}

        {!isLoading && !error && logs.length > 0 && (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div
                key={log.id || index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(log.action)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {getTableLabel(log.table_name)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(new Date(log.created_at))}
                      </div>
                    </div>
                  </div>
                  
                  {log.automated && (
                    <Badge variant="secondary" className="text-xs">
                      Automático
                    </Badge>
                  )}
                </div>

                {log.error_message && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>Error:</strong> {log.error_message}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {log.old_values && Object.keys(log.old_values).length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Valores Anteriores:
                      </h5>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(log.old_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {log.new_values && Object.keys(log.new_values).length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Valores Nuevos:
                      </h5>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {log.record_id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>ID del Registro:</strong> {log.record_id}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AutomationLogsModal;