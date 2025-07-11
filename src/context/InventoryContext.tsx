import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Item, RawMaterial, ItemFormData, RawMaterialFormData, OrderMaterial, OrderMaterialFormData, Sale, SaleFormData } from '../types';
import { generateId, generateSaleId } from '../utils/helpers';
import { apiService } from '../services/api';

// Define the state type
interface InventoryState {
  items: Item[];
  rawMaterials: RawMaterial[];
  orderMaterials: OrderMaterial[];
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
}

// Define the action types
type InventoryAction =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'SET_RAW_MATERIALS'; payload: RawMaterial[] }
  | { type: 'SET_ORDER_MATERIALS'; payload: OrderMaterial[] }
  | { type: 'SET_SALES'; payload: Sale[] }
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
  addSale: (saleData: SaleFormData) => Promise<void>;
  updateSale: (id: string, saleData: SaleFormData) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Initial state
const initialState: InventoryState = {
  items: [],
  rawMaterials: [],
  orderMaterials: [],
  sales: [],
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
    createdAt: new Date(apiSale.created_at),
    updatedAt: new Date(apiSale.updated_at)
  })
};

// Transform frontend data to API format
const transformToApiData = {
  rawMaterial: (data: RawMaterialFormData) => ({
    ...data,
    image_url: data.imageUrl
  }),
  
  orderMaterial: (data: OrderMaterialFormData) => ({
    ...data,
    tracking_number: data.trackingNumber,
    estimated_delivery: data.estimatedDelivery
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
    total_amount: data.totalAmount
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
        apiService.getSales()
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
      const newItem = await apiService.createItem(itemData);
      dispatch({ type: 'ADD_ITEM', payload: transformApiData.item(newItem) });
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  };

  const updateItem = async (id: string, itemData: ItemFormData) => {
    try {
      const updatedItem = await apiService.updateItem(id, itemData);
      dispatch({ type: 'UPDATE_ITEM', payload: transformApiData.item(updatedItem) });
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
      const newOrder = await apiService.createOrderMaterial(transformToApiData.orderMaterial(orderData));
      dispatch({ type: 'ADD_ORDER_MATERIAL', payload: transformApiData.orderMaterial(newOrder) });
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

  const addSale = async (saleData: SaleFormData) => {
    try {
      const newSale = await apiService.createSale(transformToApiData.sale(saleData));
      dispatch({ type: 'ADD_SALE', payload: transformApiData.sale(newSale) });
      // Refresh items to get updated quantities
      const items = await apiService.getItems();
      dispatch({ type: 'SET_ITEMS', payload: items.map(transformApiData.item) });
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
    addSale,
    updateSale,
    deleteSale,
    refreshData
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