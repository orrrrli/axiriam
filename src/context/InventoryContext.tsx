import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Item, RawMaterial, ItemFormData, RawMaterialFormData } from '../types';
import { mockItems, mockRawMaterials } from '../data/mockData';
import { generateId } from '../utils/helpers';

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
  addItem: (itemData: ItemFormData) => void;
  updateItem: (id: string, itemData: ItemFormData) => void;
  deleteItem: (id: string) => void;
  addRawMaterial: (materialData: RawMaterialFormData) => void;
  updateRawMaterial: (id: string, materialData: RawMaterialFormData) => void;
  deleteRawMaterial: (id: string) => void;
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

  // Load mock data
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        dispatch({ type: 'SET_ITEMS', payload: mockItems });
        dispatch({ type: 'SET_RAW_MATERIALS', payload: mockRawMaterials });
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 1000);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load inventory data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Action creators
  const addItem = (itemData: ItemFormData) => {
    const newItem: Item = {
      ...itemData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
  };

  const updateItem = (id: string, itemData: ItemFormData) => {
    const updatedItem: Item = {
      ...itemData,
      id,
      createdAt: state.items.find(item => item.id === id)?.createdAt || new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
  };

  const deleteItem = (id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
  };

  const addRawMaterial = (materialData: RawMaterialFormData) => {
    const newMaterial: RawMaterial = {
      ...materialData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_RAW_MATERIAL', payload: newMaterial });
  };

  const updateRawMaterial = (id: string, materialData: RawMaterialFormData) => {
    const updatedMaterial: RawMaterial = {
      ...materialData,
      id,
      createdAt: state.rawMaterials.find(material => material.id === id)?.createdAt || new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'UPDATE_RAW_MATERIAL', payload: updatedMaterial });
  };

  const deleteRawMaterial = (id: string) => {
    dispatch({ type: 'DELETE_RAW_MATERIAL', payload: id });
  };

  const contextValue: InventoryContextType = {
    state,
    dispatch,
    addItem,
    updateItem,
    deleteItem,
    addRawMaterial,
    updateRawMaterial,
    deleteRawMaterial
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