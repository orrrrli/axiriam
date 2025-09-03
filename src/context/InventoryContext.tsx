import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Item, RawMaterial, ItemFormData, RawMaterialFormData, OrderMaterial, OrderMaterialFormData, Sale, SaleFormData, SaleExtra } from '../types';
import { apiService } from '../services/api';

// Define the state type
interface InventoryState {
  items: Item[];
  rawMaterials: RawMaterial[];
  orderMaterials: OrderMaterial[];
  sales: Sale[];
  extras: SaleExtra[];
  isLoading: boolean;
  error: string | null;
}

// Define the action types
type InventoryAction =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'SET_RAW_MATERIALS'; payload: RawMaterial[] }
  | { type: 'SET_ORDER_MATERIALS'; payload: OrderMaterial[] }
  | { type: 'SET_SALES'; payload: Sale[] }
  | { type: 'SET_EXTRAS'; payload: SaleExtra[] }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'REDUCE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'ADD_RAW_MATERIAL'; payload: RawMaterial }
  | { type: 'UPDATE_RAW_MATERIAL'; payload: RawMaterial }
  | { type: 'DELETE_RAW_MATERIAL'; payload: string }
  | { type: 'ADD_ORDER_MATERIAL'; payload: OrderMaterial }
  | { type: 'UPDATE_ORDER_MATERIAL'; payload: OrderMaterial }
  | { type: 'DELETE_ORDER_MATERIAL'; payload: string }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_SALE'; payload: Sale }
  | { type: 'DELETE_SALE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Define the context value type
interface InventoryContextType {
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
  addItem: (itemData: ItemFormData) => Promise<void>;
  updateItem: (id: string, itemData: ItemFormData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  reduceItemQuantity: (id: string, quantity: number) => Promise<void>;
  addRawMaterial: (materialData: RawMaterialFormData) => Promise<void>;
  updateRawMaterial: (id: string, materialData: RawMaterialFormData) => Promise<void>;
  deleteRawMaterial: (id: string) => Promise<void>;
  addOrderMaterial: (orderData: OrderMaterialFormData) => Promise<void>;
  updateOrderMaterial: (id: string, orderData: OrderMaterialFormData) => Promise<void>;
  deleteOrderMaterial: (id: string) => Promise<void>;
  checkOrderDeliveryStatus: (orderId: string) => Promise<boolean>;
  updateOrderStatusIfDelivered: (orderId: string, isDelivered: boolean) => Promise<void>;
  processOrderInventory: (orderId: string) => Promise<{ processed: boolean; updatedCount: number }>;
  addSale: (saleData: SaleFormData) => Promise<void>;
  updateSale: (id: string, saleData: SaleFormData) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getAutomationLogs: (tableNames?: string[], recordId?: string, limit?: number) => Promise<any[]>;
}

// Initial state
const initialState: InventoryState = {
  items: [],
  rawMaterials: [],
  orderMaterials: [],
  sales: [],
  extras: [],
  isLoading: false,
  error: null
};

// Create context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Reducer function
const inventoryReducer = (state: InventoryState, action: InventoryAction): InventoryState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SET_RAW_MATERIALS':
      return { ...state, rawMaterials: action.payload };
    case 'SET_ORDER_MATERIALS':
      return { ...state, orderMaterials: action.payload };
    case 'SET_SALES':
      return { ...state, sales: action.payload };
    case 'SET_EXTRAS':
      return { ...state, extras: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'REDUCE_ITEM_QUANTITY':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { 
                ...item, 
                quantity: Math.max(0, item.quantity - action.payload.quantity),
                updatedAt: new Date()
              }
            : item
        )
      };
    case 'ADD_RAW_MATERIAL':
      return { 
        ...state, 
        rawMaterials: [...state.rawMaterials, action.payload] 
      };
    case 'UPDATE_RAW_MATERIAL':
      return {
        ...state,
        rawMaterials: state.rawMaterials.map(material => 
          material.id === action.payload.id ? action.payload : material
        )
      };
    case 'DELETE_RAW_MATERIAL':
      return {
        ...state,
        rawMaterials: state.rawMaterials.filter(material => 
          material.id !== action.payload
        )
      };
    case 'ADD_ORDER_MATERIAL':
      return {
        ...state,
        orderMaterials: [...state.orderMaterials, action.payload]
      };
    case 'UPDATE_ORDER_MATERIAL':
      return {
        ...state,
        orderMaterials: state.orderMaterials.map(order =>
          order.id === action.payload.id ? action.payload : order
        )
      };
    case 'DELETE_ORDER_MATERIAL':
      return {
        ...state,
        orderMaterials: state.orderMaterials.filter(order =>
          order.id !== action.payload
        )
      };
    case 'ADD_SALE':
      return {
        ...state,
        sales: [...state.sales, action.payload]
      };
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map(sale =>
          sale.id === action.payload.id ? action.payload : sale
        )
      };
    case 'DELETE_SALE':
      return {
        ...state,
        sales: state.sales.filter(sale =>
          sale.id !== action.payload
        )
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Transform API data to match frontend types
const transformApiData = {
  item: (apiItem: any): Item => ({
    ...apiItem,
    createdAt: new Date(apiItem.created_at),
    updatedAt: new Date(apiItem.updated_at)
  }),
  
  rawMaterial: (apiMaterial: any): RawMaterial => ({
    ...apiMaterial,
    imageUrl: apiMaterial.image_url,
    createdAt: new Date(apiMaterial.created_at),
    updatedAt: new Date(apiMaterial.updated_at)
  }),
  
  orderMaterial: (apiOrder: any): OrderMaterial => ({
    ...apiOrder,
    trackingNumber: apiOrder.tracking_number,
    estimatedDelivery: apiOrder.estimated_delivery ? new Date(apiOrder.estimated_delivery) : undefined,
    createdAt: new Date(apiOrder.created_at),
    updatedAt: new Date(apiOrder.updated_at)
  }),
  
  sale: (apiSale: any): Sale => ({
    ...apiSale,
    saleId: apiSale.sale_id,
    socialMediaPlatform: apiSale.social_media_platform,
    socialMediaUsername: apiSale.social_media_username,
    trackingNumber: apiSale.tracking_number,
    invoiceRequired: apiSale.invoice_required,
    shippingType: apiSale.shipping_type,
    localShippingOption: apiSale.local_shipping_option,
    localAddress: apiSale.local_address,
    nationalShippingCarrier: apiSale.national_shipping_carrier,
    shippingDescription: apiSale.shipping_description,
    totalAmount: parseFloat(apiSale.total_amount),
    deliveryDate: apiSale.delivery_date ? new Date(apiSale.delivery_date) : undefined,
    saleItems: apiSale.sale_items ? apiSale.sale_items.map((saleItem: any) => ({
      itemId: saleItem.item_id,
      quantity: saleItem.quantity,
      addToInventory: true, // Default for existing sales
      customDesignName: undefined
    })) : [],
    extras: (() => {
      console.log('🔍 Transforming extras for sale:', apiSale.sale_id || apiSale.id);
      console.log('📋 Raw sale_extras:', JSON.stringify(apiSale.sale_extras, null, 2));
      
      let transformedExtras: any[] = [];
      
      // Use sale_extras from the API response
      if (apiSale.sale_extras && Array.isArray(apiSale.sale_extras)) {
        transformedExtras = apiSale.sale_extras.map((saleExtra: any) => {
          const extraData = saleExtra.extras || {};
          const result = {
            id: saleExtra.extra_id || extraData.id,
            description: extraData.description || 'Unknown',
            price: extraData.price !== undefined && extraData.price !== null ? parseFloat(extraData.price) : 0
          };
          console.log('🎁 Transformed extra:', result);
          return result;
        });
      }
      
      console.log('✅ Final transformed extras:', transformedExtras);
      return transformedExtras;
    })(),
    createdAt: new Date(apiSale.created_at),
    updatedAt: new Date(apiSale.updated_at)
  })
};

// Transform frontend data to API format
const transformToApiData = {
  rawMaterial: (data: RawMaterialFormData) => ({
    ...data,
    image_url: data.imageUrl,
    type: data.type
  }),
  
  orderMaterial: (data: OrderMaterialFormData) => ({
    ...data,
    tracking_number: data.trackingNumber,
    parcel_service: data.parcel_service
  }),
  
  sale: (data: SaleFormData) => ({
    ...data,
    social_media_platform: data.socialMediaPlatform,
    social_media_username: data.socialMediaUsername,
    tracking_number: data.trackingNumber,
    invoice_required: data.invoiceRequired,
    shipping_type: data.shippingType,
    local_shipping_option: data.localShippingOption,
    local_address: data.localAddress,
    national_shipping_carrier: data.nationalShippingCarrier,
    shipping_description: data.shippingDescription,
    total_amount: data.totalAmount,
    delivery_date: data.deliveryDate ? data.deliveryDate.toISOString().split('T')[0] : null,
    items: data.saleItems.filter(item => item.addToInventory).map(item => item.itemId),
    extras: data.extras
  })
};

// Provider component
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Load data from API
  const loadData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const [items, rawMaterials, orderMaterials, sales] = await Promise.all([
        apiService.getItems(),
        apiService.getRawMaterials(),
        apiService.getOrderMaterials(),
        apiService.getSales(),
      ]);

      dispatch({ type: 'SET_ITEMS', payload: items.map(transformApiData.item) });
      dispatch({ type: 'SET_RAW_MATERIALS', payload: rawMaterials.map(transformApiData.rawMaterial) });
      dispatch({ type: 'SET_ORDER_MATERIALS', payload: orderMaterials.map(transformApiData.orderMaterial) });
      dispatch({ type: 'SET_SALES', payload: sales.map(transformApiData.sale) });
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Refresh data function
  const refreshData = async () => {
    await loadData();
  };

  // Action creators
  const addItem = async (itemData: ItemFormData) => {
    try {
      // Validate raw material availability before creating item
      const insufficientMaterials: string[] = [];
      
      for (const materialId of itemData.materials) {
        const material = state.rawMaterials.find(rm => rm.id === materialId);
        if (!material) {
          throw new Error(`Raw material with ID ${materialId} not found`);
        }
        
        if (material.quantity < itemData.quantity) {
          insufficientMaterials.push(`${material.name} (disponible: ${material.quantity}, necesario: ${itemData.quantity})`);
        }
      }
      
      if (insufficientMaterials.length > 0) {
        throw new Error(`Materiales insuficientes: ${insufficientMaterials.join(', ')}`);
      }

      // Create the item
      const newItem = await apiService.createItem(itemData);
      dispatch({ type: 'ADD_ITEM', payload: transformApiData.item(newItem) });

      // Reduce raw material quantities
      const updatedRawMaterials = [...state.rawMaterials];
      
      for (const materialId of itemData.materials) {
        const materialIndex = updatedRawMaterials.findIndex(rm => rm.id === materialId);
        
        if (materialIndex !== -1) {
          const currentMaterial = updatedRawMaterials[materialIndex];
          const newQuantity = currentMaterial.quantity - itemData.quantity;
          
          console.log(`📉 Reducing raw material ${materialId}: ${currentMaterial.quantity} - ${itemData.quantity} = ${newQuantity}`);
          
          // Update the raw material quantity in the backend
          const updatedMaterial = await apiService.updateRawMaterial(materialId, {
            name: currentMaterial.name,
            description: currentMaterial.description,
            width: currentMaterial.width,
            height: currentMaterial.height,
            quantity: newQuantity,
            price: currentMaterial.price,
            supplier: currentMaterial.supplier,
            imageUrl: currentMaterial.imageUrl
          });
          
          // Update local state
          updatedRawMaterials[materialIndex] = transformApiData.rawMaterial(updatedMaterial);
        }
      }
      
      // Update the state with new quantities
      dispatch({ type: 'SET_RAW_MATERIALS', payload: updatedRawMaterials });
      
      console.log(`✅ Item created and ${itemData.materials.length} raw materials updated`);
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  };

  const updateItem = async (id: string, itemData: ItemFormData) => {
    try {
      // Get the current item to compare quantities
      const currentItem = state.items.find(item => item.id === id);
      if (!currentItem) {
        throw new Error(`Item with ID ${id} not found`);
      }

      // Calculate the quantity difference
      const quantityDifference = itemData.quantity - currentItem.quantity;
      
      // Only reduce raw materials if quantity is being increased
      if (quantityDifference > 0) {
        console.log(`📈 Item quantity increased by ${quantityDifference}, checking raw materials...`);
        
        // Validate raw material availability for the additional quantity
        const insufficientMaterials: string[] = [];
        
        for (const materialId of itemData.materials) {
          const material = state.rawMaterials.find(rm => rm.id === materialId);
          if (!material) {
            throw new Error(`Raw material with ID ${materialId} not found`);
          }
          
          if (material.quantity < quantityDifference) {
            insufficientMaterials.push(`${material.name} (disponible: ${material.quantity}, necesario: ${quantityDifference})`);
          }
        }
        
        if (insufficientMaterials.length > 0) {
          throw new Error(`Materiales insuficientes para el aumento de cantidad: ${insufficientMaterials.join(', ')}`);
        }

        // Update the item first
        const updatedItem = await apiService.updateItem(id, itemData);
        dispatch({ type: 'UPDATE_ITEM', payload: transformApiData.item(updatedItem) });

        // Reduce raw material quantities by the difference
        const updatedRawMaterials = [...state.rawMaterials];
        
        for (const materialId of itemData.materials) {
          const materialIndex = updatedRawMaterials.findIndex(rm => rm.id === materialId);
          
          if (materialIndex !== -1) {
            const currentMaterial = updatedRawMaterials[materialIndex];
            const newQuantity = currentMaterial.quantity - quantityDifference;
            
            console.log(`📉 Reducing raw material ${materialId}: ${currentMaterial.quantity} - ${quantityDifference} = ${newQuantity}`);
            
            // Update the raw material quantity in the backend
            const updatedMaterial = await apiService.updateRawMaterial(materialId, {
              name: currentMaterial.name,
              description: currentMaterial.description,
              width: currentMaterial.width,
              height: currentMaterial.height,
              quantity: newQuantity,
              price: currentMaterial.price,
              supplier: currentMaterial.supplier,
              imageUrl: currentMaterial.imageUrl
            });
            
            // Update local state
            updatedRawMaterials[materialIndex] = transformApiData.rawMaterial(updatedMaterial);
          }
        }
        
        // Update the state with new quantities
        dispatch({ type: 'SET_RAW_MATERIALS', payload: updatedRawMaterials });
        
        console.log(`✅ Item updated and ${itemData.materials.length} raw materials reduced by ${quantityDifference}`);
      } else {
        // Just update the item without touching raw materials
        console.log(`📝 Item updated without quantity change (${currentItem.quantity} → ${itemData.quantity})`);
        const updatedItem = await apiService.updateItem(id, itemData);
        dispatch({ type: 'UPDATE_ITEM', payload: transformApiData.item(updatedItem) });
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await apiService.deleteItem(id);
      dispatch({ type: 'DELETE_ITEM', payload: id });
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  };

  const reduceItemQuantity = async (id: string, quantity: number) => {
    try {
      const updatedItem = await apiService.reduceItemQuantity(id, quantity);
      dispatch({ type: 'UPDATE_ITEM', payload: transformApiData.item(updatedItem) });
    } catch (error) {
      console.error('Failed to reduce item quantity:', error);
      throw error;
    }
  };

  const addRawMaterial = async (materialData: RawMaterialFormData) => {
    try {
      const newMaterial = await apiService.createRawMaterial(transformToApiData.rawMaterial(materialData));
      dispatch({ type: 'ADD_RAW_MATERIAL', payload: transformApiData.rawMaterial(newMaterial) });
    } catch (error) {
      console.error('Failed to add raw material:', error);
      throw error;
    }
  };

  const updateRawMaterial = async (id: string, materialData: RawMaterialFormData) => {
    try {
      const updatedMaterial = await apiService.updateRawMaterial(id, transformToApiData.rawMaterial(materialData));
      dispatch({ type: 'UPDATE_RAW_MATERIAL', payload: transformApiData.rawMaterial(updatedMaterial) });
    } catch (error) {
      console.error('Failed to update raw material:', error);
      throw error;
    }
  };

  const deleteRawMaterial = async (id: string) => {
    try {
      await apiService.deleteRawMaterial(id);
      dispatch({ type: 'DELETE_RAW_MATERIAL', payload: id });
    } catch (error) {
      console.error('Failed to delete raw material:', error);
      throw error;
    }
  };

  const addOrderMaterial = async (orderData: OrderMaterialFormData) => {
    try {
      console.log('🚀 Adding order material with data:', orderData);
      
      // First, create raw materials for custom designs and get their IDs
      const processedOrderData = { ...orderData };
      
      for (let materialIndex = 0; materialIndex < processedOrderData.materials.length; materialIndex++) {
        const material = processedOrderData.materials[materialIndex];
        
        for (let designIndex = 0; designIndex < material.designs.length; designIndex++) {
          const design = material.designs[designIndex];
          
          // If it's a custom design, create the raw material first
          if (!design.addToInventory && design.customDesignName) {
            try {
              console.log(`🎨 Creating raw material for custom design: ${design.customDesignName}`);
              
              const rawMaterialData: RawMaterialFormData = {
                name: design.customDesignName || 'Diseño personalizado',
                description: `Diseño personalizado creado desde pedido de material`,
                width: 1.5, // Default dimensions
                height: 1.0,
                type: 'normal' as const,
                quantity: 0, // Will be updated when order is received
                price: 0, // Can be updated later
                supplier: 'Diseño personalizado',
                imageUrl: ''
              };
              
              const newRawMaterial = await apiService.createRawMaterial(transformToApiData.rawMaterial(rawMaterialData));
              console.log(`✅ Raw material created for: ${design.customDesignName}`, newRawMaterial);
              
              // Update the design to use the new raw material ID
              processedOrderData.materials[materialIndex].designs[designIndex].rawMaterialId = newRawMaterial.id;
              
            } catch (error) {
              console.error(`❌ Failed to create raw material for ${design.customDesignName}:`, error);
              throw new Error(`No se pudo crear el material personalizado: ${design.customDesignName}`);
            }
          }
        }
      }
      
      // Now create the order with valid raw material IDs
      const newOrder = await apiService.createOrderMaterial(transformToApiData.orderMaterial(processedOrderData));
      console.log('✅ Order material created successfully:', newOrder);
      dispatch({ type: 'ADD_ORDER_MATERIAL', payload: transformApiData.orderMaterial(newOrder) });

      // Refresh raw materials to show any newly created ones
      const rawMaterials = await apiService.getRawMaterials();
      dispatch({ type: 'SET_RAW_MATERIALS', payload: rawMaterials.map(transformApiData.rawMaterial) });
      
      console.log(`✅ Order material created successfully with all custom designs`);
    } catch (error) {
      console.error('Failed to add order material:', error);
      throw error;
    }
  };

  const updateOrderMaterial = async (id: string, orderData: OrderMaterialFormData) => {
    try {
      const updatedOrder = await apiService.updateOrderMaterial(id, transformToApiData.orderMaterial(orderData));
      dispatch({ type: 'UPDATE_ORDER_MATERIAL', payload: transformApiData.orderMaterial(updatedOrder) });
    } catch (error) {
      console.error('Failed to update order material:', error);
      throw error;
    }
  };

  const deleteOrderMaterial = async (id: string) => {
    try {
      await apiService.deleteOrderMaterial(id);
      dispatch({ type: 'DELETE_ORDER_MATERIAL', payload: id });
    } catch (error) {
      console.error('Failed to delete order material:', error);
      throw error;
    }
  };

  const checkOrderDeliveryStatus = async (orderId: string): Promise<boolean> => {
    try {
      const result = await apiService.checkOrderDeliveryStatus(orderId);
      return result.isDelivered || false;
    } catch (error) {
      console.error('Failed to check order delivery status:', error);
      return false;
    }
  };

  const updateOrderStatusIfDelivered = async (orderId: string, isDelivered: boolean) => {
    try {
      const result = await apiService.updateOrderStatusIfDelivered(orderId, isDelivered);
      if (result.updated) {
        // Refresh both order materials and raw materials to get updated data
        const [orderMaterials, rawMaterials] = await Promise.all([
          apiService.getOrderMaterials(),
          apiService.getRawMaterials()
        ]);
        dispatch({ type: 'SET_ORDER_MATERIALS', payload: orderMaterials.map(transformApiData.orderMaterial) });
        dispatch({ type: 'SET_RAW_MATERIALS', payload: rawMaterials.map(transformApiData.rawMaterial) });
        
        // If order was marked as received, trigger inventory processing
        if (isDelivered) {
          try {
            console.log('🏭 Triggering inventory processing for delivered order...');
            await processOrderInventory(orderId);
          } catch (inventoryError) {
            console.error('❌ Failed to process inventory:', inventoryError);
            // Don't throw here - status update succeeded, inventory processing is secondary
          }
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  const processOrderInventory = async (orderId: string) => {
    try {
      console.log('🔄 Processing inventory for order:', orderId);
      
      // Find the order to process
      const order = state.orderMaterials.find(o => o.id === orderId);
      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      console.log('📦 Order materials to process:', order.materials);

      // Process each material in the order
      const updatedRawMaterials = [...state.rawMaterials];
      let processedCount = 0;

      for (const material of order.materials) {
        for (const design of material.designs) {
          const rawMaterialIndex = updatedRawMaterials.findIndex(rm => rm.id === design.rawMaterialId);
          
          if (rawMaterialIndex !== -1) {
            const currentQuantity = updatedRawMaterials[rawMaterialIndex].quantity;
            const newQuantity = currentQuantity + design.quantity;
            
            console.log(`📈 Updating raw material ${design.rawMaterialId}: ${currentQuantity} + ${design.quantity} = ${newQuantity}`);
            
            // Update the raw material quantity in the backend, preserving all existing data
            const currentMaterial = updatedRawMaterials[rawMaterialIndex];
            const updatedMaterial = await apiService.updateRawMaterial(design.rawMaterialId, {
              name: currentMaterial.name,
              description: currentMaterial.description,
              width: currentMaterial.width,
              height: currentMaterial.height,
              quantity: newQuantity,
              price: currentMaterial.price,
              supplier: currentMaterial.supplier,
              imageUrl: currentMaterial.imageUrl
            });
            
            // Update local state
            updatedRawMaterials[rawMaterialIndex] = transformApiData.rawMaterial(updatedMaterial);
            processedCount++;
          } else {
            console.warn(`⚠️ Raw material ${design.rawMaterialId} not found in inventory`);
          }
        }
      }

      // Update the state with new quantities
      dispatch({ type: 'SET_RAW_MATERIALS', payload: updatedRawMaterials });
      
      console.log(`✅ Inventory processing completed successfully. Updated ${processedCount} raw materials.`);
      
      return { processed: true, updatedCount: processedCount };
    } catch (error) {
      console.error('Failed to process order inventory:', error);
      throw error;
    }
  };

  const addSale = async (saleData: SaleFormData) => {
    try {
      console.log('🚀 Adding sale with data:', saleData);
      
      // Validate item availability before creating sale
      const insufficientItems: string[] = [];
      
      // Only validate inventory items
      const inventoryItems = saleData.saleItems.filter(item => item.addToInventory);
      
      for (const saleItem of inventoryItems) {
        const item = state.items.find(i => i.id === saleItem.itemId);
        if (!item) {
          throw new Error(`Item with ID ${saleItem.itemId} not found`);
        }
        
        if (item.quantity < saleItem.quantity) {
          insufficientItems.push(`${item.name} (disponible: ${item.quantity}, necesario: ${saleItem.quantity})`);
        }
      }
      
      if (insufficientItems.length > 0) {
        throw new Error(`Stock insuficiente: ${insufficientItems.join(', ')}`);
      }

      // Create the sale
      const newSale = await apiService.createSale(transformToApiData.sale(saleData));
      console.log('✅ Sale created successfully:', newSale);
      dispatch({ type: 'ADD_SALE', payload: transformApiData.sale(newSale) });

      // Create raw materials for custom designs
      const customDesigns = saleData.saleItems.filter(item => !item.addToInventory && item.customDesignName);
      
      for (const customItem of customDesigns) {
        try {
          console.log(`🎨 Creating raw material for custom design: ${customItem.customDesignName}`);
          
          const rawMaterialData: RawMaterialFormData = {
            name: customItem.customDesignName || 'Diseño personalizado',
            description: `Diseño personalizado creado desde venta ${newSale.sale_id || 'N/A'}`,
            width: 1.5, // Default dimensions
            height: 1.0,
            type: 'normal' as const,
            quantity: customItem.quantity,
            price: 0, // Can be updated later
            supplier: 'Diseño personalizado',
            imageUrl: ''
          };
          
          await apiService.createRawMaterial(transformToApiData.rawMaterial(rawMaterialData));
          console.log(`✅ Raw material created for: ${customItem.customDesignName}`);
        } catch (error) {
          console.error(`❌ Failed to create raw material for ${customItem.customDesignName}:`, error);
          // Don't fail the entire sale if raw material creation fails
        }
      }

      // Reduce item quantities for inventory items only
      const updatedItems = [...state.items];
      
      for (const saleItem of inventoryItems) {
        const itemIndex = updatedItems.findIndex(i => i.id === saleItem.itemId);
        
        if (itemIndex !== -1) {
          const currentItem = updatedItems[itemIndex];
          const newQuantity = currentItem.quantity - saleItem.quantity;
          
          console.log(`📉 Reducing item ${saleItem.itemId}: ${currentItem.quantity} - ${saleItem.quantity} = ${newQuantity}`);
          
          // Update the item quantity in the backend
          const updatedItem = await apiService.updateItem(saleItem.itemId, {
            name: currentItem.name,
            category: currentItem.category,
            type: currentItem.type,
            description: currentItem.description,
            quantity: newQuantity,
            price: currentItem.price,
            materials: currentItem.materials
          });
          
          // Update local state
          updatedItems[itemIndex] = transformApiData.item(updatedItem);
        }
      }
      
      // Update the state with new quantities
      dispatch({ type: 'SET_ITEMS', payload: updatedItems });
      
      // Refresh raw materials to show any newly created ones
      const rawMaterials = await apiService.getRawMaterials();
      dispatch({ type: 'SET_RAW_MATERIALS', payload: rawMaterials.map(transformApiData.rawMaterial) });
      
      console.log(`✅ Sale created and ${inventoryItems.length} inventory items updated, ${customDesigns.length} custom designs created`);
    } catch (error) {
      console.error('Failed to add sale:', error);
      throw error;
    }
  };

  const updateSale = async (id: string, saleData: SaleFormData) => {
    try {
      const updatedSale = await apiService.updateSale(id, transformToApiData.sale(saleData));
      dispatch({ type: 'UPDATE_SALE', payload: transformApiData.sale(updatedSale) });
      // Refresh items to get updated quantities
      const items = await apiService.getItems();
      dispatch({ type: 'SET_ITEMS', payload: items.map(transformApiData.item) });
    } catch (error) {
      console.error('Failed to update sale:', error);
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      await apiService.deleteSale(id);
      dispatch({ type: 'DELETE_SALE', payload: id });
      // Refresh items to get updated quantities
      const items = await apiService.getItems();
      dispatch({ type: 'SET_ITEMS', payload: items.map(transformApiData.item) });
    } catch (error) {
      console.error('Failed to delete sale:', error);
      throw error;
    }
  };

  const getAutomationLogs = async (tableNames?: string[], recordId?: string, limit: number = 50) => {
    try {
      return await apiService.getAutomationLogs(tableNames, recordId, limit);
    } catch (error) {
      console.error('Failed to get automation logs:', error);
      throw error;
    }
  };

  const contextValue: InventoryContextType = {
    state,
    dispatch,
    addItem,
    updateItem,
    deleteItem,
    reduceItemQuantity,
    addRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    addOrderMaterial,
    updateOrderMaterial,
    deleteOrderMaterial,
    checkOrderDeliveryStatus,
    updateOrderStatusIfDelivered,
    processOrderInventory,
    addSale,
    updateSale,
    deleteSale,
    refreshData,
    getAutomationLogs
  };

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

// Custom hook to use the inventory context
export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};