export interface Item {
  id: string;
  name: string;
  category: 'sencillo' | 'doble-vista' | 'completo';
  type: 'algodon' | 'normal' | 'microfibra'; // New field for item type
  description: string;
  quantity: number;
  price: number;
  materials: string[]; // IDs of raw materials used
  createdAt: Date;
  updatedAt: Date;
}

export interface RawMaterial {
  id: string;
  name: string;
  description: string;
  width: number; // in meters
  height: number; // in meters
  quantity: number; // quantity in stock
  price: number;
  supplier: string;
  imageUrl?: string; // Optional design image URL
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderMaterialItem {
  rawMaterialId: string;
  height: number; // in meters
  width: number; // in meters
  quantity: number; // final quantity in m²
}

export interface OrderMaterial {
  id: string;
  materials: {
    designs: {
      rawMaterialId: string;
      quantity: number;
    }[];
  }[];
  distributor: string;
  description: string;
  status: 'pending' | 'ordered' | 'received';
  trackingNumber?: string; // Optional tracking number for shipment
  parcel_service?: 'Estafeta' | 'DHL' ; // New field for parcel service
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  name: string;
  status: 'pending' | 'shipped' | 'delivered';
  socialMediaPlatform: 'facebook' | 'instagram' | 'whatsapp';
  socialMediaUsername: string;
  saleId: string; // UUID for sale identification
  trackingNumber: string;
  invoiceRequired: boolean;
  shippingType: 'local' | 'nacional';
  localShippingOption?: 'meeting-point' | 'pzexpress';
  localAddress?: string;
  nationalShippingCarrier?: 'estafeta' | 'dhl' | 'fedex' | 'correos';
  shippingDescription?: string;
  discount: number;
  totalAmount: number;
  deliveryDate?: Date; // New delivery date field
  items: string[]; // Keep for backward compatibility
  saleItems: SaleItem[]; // Items sold with quantities
  extras: SaleExtra[]; // Extra services/products
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  itemId: string;
  quantity: number;
  addToInventory: boolean; // Whether this item should affect inventory
  customDesignName?: string; // Custom design name for non-inventory items
}

export interface SaleExtra {
  id?: string;
  description: string;
  price: number;
}

export interface SaleFormData {
  name: string;
  status: 'pending' | 'shipped' | 'delivered';
  socialMediaPlatform: 'facebook' | 'instagram' | 'whatsapp';
  socialMediaUsername: string;
  trackingNumber: string;
  invoiceRequired: boolean;
  shippingType: 'local' | 'nacional';
  localShippingOption?: 'meeting-point' | 'pzexpress';
  localAddress?: string;
  nationalShippingCarrier?: 'estafeta' | 'dhl' | 'fedex' | 'correos';
  shippingDescription?: string;
  discount: number;
  totalAmount: number;
  deliveryDate?: Date; // New delivery date field
  items: string[]; // Keep for backward compatibility
  saleItems: SaleItem[];
  extras: SaleExtra[];
}

export type ItemFormData = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type RawMaterialFormData = Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>;
export type OrderMaterialFormData = Omit<OrderMaterial, 'id' | 'createdAt' | 'updatedAt'>;
