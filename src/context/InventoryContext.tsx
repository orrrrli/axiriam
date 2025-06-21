import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Item, RawMaterial, ItemFormData, RawMaterialFormData } from '../types';
import { itemsApi, materialsApi } from '../services/api';

// Define the state type
interface InventoryState {
  items: Item[];
  rawMaterials: RawMaterial[];
  isLoading: boolean;
  error: string | null;
}

// Define the action types
type InventoryAction =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'SET_RAW_MATERIALS'; payload: RawMaterial[] }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_RAW_MATERIAL'; payload: RawMaterial }
  | { type: 'UPDATE_RAW_MATERIAL'; payload: RawMaterial }
  | { type: 'DELETE_RAW_MATERIAL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Define the context value type
interface InventoryContextType {
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
  addItem: (itemData: ItemFormData) => Promise<void>;
  updateItem: (id: string, itemData: ItemFormData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addRawMaterial: (materialData: RawMaterialFormData) => Promise<void>;
  updateRawMaterial: (id: string, materialData: RawMaterialFormData) => Promise<void>;
  deleteRawMaterial: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Initial state
const initialState: InventoryState = {
  items: [],
  rawMaterials: [],
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
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Provider component
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Load data from API
  const refreshData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const [items, materials] = await Promise.all([
        itemsApi.getAll(),
        materialsApi.getAll()
      ]);
      
      dispatch({ type: 'SET_ITEMS', payload: items });
      dispatch({ type: 'SET_RAW_MATERIALS', payload: materials });
    } catch (error) {
      console.error('Error loading inventory data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load inventory data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  // Action creators
  const addItem = async (itemData: ItemFormData) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const newItem = await itemsApi.create(itemData);
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateItem = async (id: string, itemData: ItemFormData) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const updatedItem = await itemsApi.update(id, itemData);
      dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
    } catch (error) {
      console.error('Error updating item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await itemsApi.delete(id);
      dispatch({ type: 'DELETE_ITEM', payload: id });
    } catch (error) {
      console.error('Error deleting item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const addRawMaterial = async (materialData: RawMaterialFormData) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const newMaterial = await materialsApi.create(materialData);
      dispatch({ type: 'ADD_RAW_MATERIAL', payload: newMaterial });
    } catch (error) {
      console.error('Error adding material:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add material';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateRawMaterial = async (id: string, materialData: RawMaterialFormData) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const updatedMaterial = await materialsApi.update(id, materialData);
      dispatch({ type: 'UPDATE_RAW_MATERIAL', payload: updatedMaterial });
    } catch (error) {
      console.error('Error updating material:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update material';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteRawMaterial = async (id: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await materialsApi.delete(id);
      dispatch({ type: 'DELETE_RAW_MATERIAL', payload: id });
    } catch (error) {
      console.error('Error deleting material:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete material';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const contextValue: InventoryContextType = {
    state,
    dispatch,
    addItem,
    updateItem,
    deleteItem,
    addRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
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