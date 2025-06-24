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

export interface OrderMaterial {
  id: string;
  rawMaterialId: string; // Reference to RawMaterial
  distributor: string;
  description: string;
  quantity: number;
  status: 'pending' | 'ordered' | 'received';
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  name: string;
  status: 'pending' | 'shipped' | 'delivered';
  socialMedia: string;
  saleId: string; // UUID for sale identification
  trackingNumber: string;
  invoiceRequired: boolean;
  shippingType: 'local' | 'nacional';
  localShippingOption?: 'meeting-point' | 'pzexpress';
  localAddress?: string;
  nationalShippingCarrier?: 'estafeta' | 'dhl' | 'fedex' | 'correos';
  shippingDescription?: string;
  totalAmount: number;
  items: string[]; // IDs of items sold
  createdAt: Date;
  updatedAt: Date;
}

export type ItemFormData = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type RawMaterialFormData = Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>;
export type OrderMaterialFormData = Omit<OrderMaterial, 'id' | 'createdAt' | 'updatedAt'>;
export type SaleFormData = Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'saleId'>;