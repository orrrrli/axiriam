import React from 'react';
import { OrderMaterial } from '../../types';
import { formatDate } from '../../utils/helpers';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Package, Truck, Calendar, MapPin, User } from 'lucide-react';

interface ShipmentTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderMaterial;
}

const ShipmentTrackerModal: React.FC<ShipmentTrackerModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'ordered':
        return 'primary';
      case 'received':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'ordered':
        return 'Ordenado';
      case 'received':
        return 'Recibido';
      default:
        return status;
    }
  };

  const getTrackingSteps = () => {
    const steps = [
      {
        id: 'pending',
        label: 'Pedido Creado',
        description: 'El pedido ha sido registrado en el sistema',
        completed: true,
        date: order.createdAt
      },
      {
        id: 'ordered',
        label: 'Pedido Enviado al Distribuidor',
        description: 'El pedido ha sido enviado al distribuidor',
        completed: order.status === 'ordered' || order.status === 'received',
        date: order.status === 'ordered' || order.status === 'received' ? order.updatedAt : null
      },
      {
        id: 'received',
        label: 'Material Recibido',
        description: 'El material ha sido recibido y está disponible',
        completed: order.status === 'received',
        date: order.status === 'received' ? order.updatedAt : null
      }
    ];

    return steps;
  };

  const trackingSteps = getTrackingSteps();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seguimiento de Pedido"
      size="lg"
    >
      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pedido de Material
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {order.id}
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Distribuidor
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.distributor}
                </p>
              </div>
            </div>
            
            {order.trackingNumber && (
              <div className="flex items-center">
                <Package className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Número de Seguimiento
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {order.trackingNumber}
                  </p>
                </div>
              </div>
            )}
            
            {order.estimatedDelivery && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Entrega Estimada
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(order.estimatedDelivery)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Estado del Pedido
          </h4>
          
          <div className="space-y-4">
            {trackingSteps.map((step, index) => (
              <div key={step.id} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {step.completed ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  {index < trackingSteps.length - 1 && (
                    <div className={`
                      w-0.5 h-8 mx-auto mt-2
                      ${step.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                    `} />
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className={`
                        text-sm font-medium
                        ${step.completed 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                        }
                      `}>
                        {step.label}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {step.description}
                      </p>
                    </div>
                    
                    {step.date && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(step.date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Detalles del Pedido
          </h4>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Descripción:</strong> {order.description || 'Sin descripción'}
            </p>
            
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Total de materiales: {order.materials.length} grupo(s)
              </p>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Creado:</strong> {formatDate(order.createdAt)}</p>
                <p><strong>Última actualización:</strong> {formatDate(order.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShipmentTrackerModal;