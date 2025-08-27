import React, { useState, useEffect } from 'react';
import { OrderMaterial } from '../../types';
import { formatDate } from '../../utils/helpers';
import { apiService } from '../../services/api';
import { useInventory } from '../../context/InventoryContext';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

// Estafeta tracking interfaces
interface EstafetaTrackingEvent {
  date: string;
  time: string;
  location: string;
  description: string;
}

interface EstafetaTrackingData {
  wayBill: string;
  events: EstafetaTrackingEvent[];
  cached: boolean;
}

interface EstafetaTrackingResponse {
  success: boolean;
  data: EstafetaTrackingData;
  count: number;
}

// DHL tracking interfaces
interface DHLTrackingEvent {
  timestamp: string;
  location: {
    address: {
      addressLocality: string;
      countryCode: string;
    };
  };
  statusCode: string;
  status: string;
  description: string;
  pieceIds: string[];
}

interface DHLShipment {
  id: string;
  service: string;
  origin: {
    address: {
      addressLocality: string;
    };
  };
  destination: {
    address: {
      addressLocality: string;
    };
  };
  status: {
    timestamp: string;
    location: {
      address: {
        addressLocality: string;
        countryCode: string;
      };
    };
    statusCode: string;
    status: string;
    description: string;
  };
  events: DHLTrackingEvent[];
}

interface DHLTrackingResponse {
  shipments: DHLShipment[];
}

// Unified tracking data interface
interface UnifiedTrackingEvent {
  timestamp: Date;
  location: string;
  description: string;
  isDelivered: boolean;
}

interface UnifiedTrackingData {
  trackingNumber: string;
  service: string;
  origin?: string;
  destination?: string;
  events: UnifiedTrackingEvent[];
  cached?: boolean;
}

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
  const { updateOrderStatusIfDelivered } = useInventory();
  const [trackingData, setTrackingData] = useState<UnifiedTrackingData | null>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch tracking data when modal opens and tracking number exists
  useEffect(() => {
    if (isOpen && order.trackingNumber && order.trackingNumber.trim()) {
      fetchTrackingData();
    }
  }, [isOpen, order.trackingNumber]);

  const parseEstafetaData = (response: EstafetaTrackingResponse): UnifiedTrackingData => {
    const events: UnifiedTrackingEvent[] = response.data.events.map(event => {
      // Parse the date format "25/07/2025" and time "18:44 hrs."
      const [day, month, year] = event.date.split('/');
      const cleanTime = event.time.replace(' hrs.', '');
      const [hours, minutes] = cleanTime.split(':');
      
      const timestamp = new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day), 
        parseInt(hours), 
        parseInt(minutes)
      );

      return {
        timestamp,
        location: event.location,
        description: event.description,
        isDelivered: event.description.toLowerCase().includes('entregado')
      };
    });

    return {
      trackingNumber: response.data.wayBill,
      service: 'Estafeta',
      events,
      cached: response.data.cached
    };
  };

  const parseDHLData = (response: DHLTrackingResponse): UnifiedTrackingData => {
    if (!response.shipments || response.shipments.length === 0) {
      throw new Error('No shipment data found');
    }

    const shipment = response.shipments[0];
    
    const events: UnifiedTrackingEvent[] = shipment.events.map(event => {
      const timestamp = new Date(event.timestamp);
      
      return {
        timestamp,
        location: event.location.address.addressLocality,
        description: event.description,
        isDelivered: event.statusCode === 'delivered'
      };
    });

    // Sort events by timestamp (most recent first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      trackingNumber: shipment.id,
      service: 'DHL Express',
      origin: shipment.origin.address.addressLocality,
      destination: shipment.destination.address.addressLocality,
      events
    };
  };

  const fetchTrackingData = async () => {
    if (!order.trackingNumber || !order.trackingNumber.trim()) return;
    if (!order.parcel_service) {
      setTrackingError('Servicio de paquetería no especificado');
      return;
    }

    setIsLoadingTracking(true);
    setTrackingError(null);
    setTrackingData(null); // Clear previous tracking data

    try {
      const trackingNumber = order.trackingNumber.trim();
      const result = await apiService.getTracking(order.parcel_service, trackingNumber);

      console.log(`Fetching tracking data from: ${trackingNumber}`);

      let unifiedData: UnifiedTrackingData;
      
      if (order.parcel_service === 'Estafeta') {
        if (result.success && result.data) {
          unifiedData = parseEstafetaData(result);
        } else {
          throw new Error('No tracking data available from Estafeta');
        }
      } else if (order.parcel_service === 'DHL') {
        unifiedData = parseDHLData(result);
      } else {
        throw new Error('Unsupported parcel service');
      }
      
      setTrackingData(unifiedData);
     
     // Check if shipment is delivered and auto-update order status
     const isDelivered = unifiedData.events.some(event => event.isDelivered);
     if (isDelivered && order.status === 'ordered') {
       try {
         setIsUpdatingStatus(true);
         await updateOrderStatusIfDelivered(order.id, true);
         console.log('✅ Order status automatically updated to "received" due to delivery confirmation');
       } catch (error) {
         console.error('❌ Failed to auto-update order status:', error);
       } finally {
         setIsUpdatingStatus(false);
       }
     }
    } catch (error) {
      console.error('Failed to fetch tracking data:', error);
      setTrackingError(
        error instanceof Error 
          ? error.message 
          : 'Error al obtener información de seguimiento'
      );
    } finally {
      setIsLoadingTracking(false);
    }
  };

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

  const formatTrackingTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                Paquetería: {order.parcel_service}
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
                {isUpdatingStatus && (
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Actualizando estado...
                  </div>
                )}
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
          </div>
        </div>


        {/* Real-time Tracking Information */}
        {order.trackingNumber && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seguimiento en Tiempo Real
              </h4>
              {trackingData?.cached !== undefined && trackingData.cached && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  Información en caché
                </span>
              )}
            </div>

            {isLoadingTracking && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Obteniendo información de seguimiento...
                </span>
              </div>
            )}

            {trackingError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <h5 className="text-sm font-medium text-red-800 dark:text-red-300">
                      No se pudo obtener la información de seguimiento
                    </h5>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Por favor, verifica el número de seguimiento o intenta más tarde.
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchTrackingData}
                  className="mt-3 text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline"
                >
                  Intentar nuevamente
                </button>
              </div>
            )}

            {trackingData && !isLoadingTracking && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        Número de Guía: {trackingData.trackingNumber}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {trackingData.events.length} eventos registrados
                      </p>
                      {trackingData.service && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Servicio: {trackingData.service}
                        </p>
                      )}
                      {trackingData.origin && trackingData.destination && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {trackingData.origin} → {trackingData.destination}
                        </p>
                      )}
                    </div>
                    <Truck className="h-6 w-6 text-blue-500" />
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-4">
                    {trackingData.events.map((event, index) => {
                      const isLatest = index === 0;
                      const isDelivered = event.isDelivered;
                      
                      return (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className={`
                              w-3 h-3 rounded-full mt-2
                              ${isDelivered 
                                ? 'bg-green-500' 
                                : isLatest 
                                  ? 'bg-blue-500' 
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }
                            `} />
                            
                            {index < trackingData.events.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-600 mx-auto mt-2" />
                            )}
                          </div>
                          
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className={`
                                  text-sm font-medium
                                  ${isDelivered 
                                    ? 'text-green-700 dark:text-green-300' 
                                    : isLatest 
                                      ? 'text-blue-700 dark:text-blue-300' 
                                      : 'text-gray-700 dark:text-gray-300'
                                  }
                                `}>
                                  {event.description}
                                </p>
                                
                                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span className="mr-3">{event.location}</span>
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{formatTrackingTimestamp(event.timestamp)}</span>
                                </div>
                              </div>
                              
                              {isLatest && (
                                <Badge variant={isDelivered ? 'success' : 'primary'}>
                                  {isDelivered ? 'Entregado' : 'Último evento'}
                                </Badge>
                              )}
                              
                              {isDelivered && order.status === 'ordered' && (
                                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-700">
                                  <p className="text-xs text-green-700 dark:text-green-300">
                                    🎉 ¡Paquete entregado! El estado del pedido se actualizará automáticamente.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Details */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Detalles del Pedido
          </h4>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Descripción:</strong> {order.description || 'Sin descripción'}
            </p>
            
            {order.trackingNumber && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Número de seguimiento:</strong> {order.trackingNumber}
              </p>
            )}
            
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