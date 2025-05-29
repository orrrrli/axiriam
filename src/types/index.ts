export interface Item {
  id: string;
  name: string;
  category: 'sencillo' | 'doble-vista' | 'completo-ajustable';
  description: string;
  quantity: number;
  price: number;
  materials: string[]; // IDs of raw materials used
  createdAt: Date;
  updatedAt: Date;
}

export const unitRawMaterial = [
  'm²'
]

export interface RawMaterial {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ItemFormData = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type RawMaterialFormData = Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>;