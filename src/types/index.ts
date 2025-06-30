export interface Item {
  id: string;
  name: string;
  category: 'sencillo' | 'doble-vista' | 'completo' | 'sencillo-algodon' | 'completo-algodon' | 'stretch';
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
  price: number;
  supplier: string;
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
      height: number;
      width: number;
    }[];
  }[];
  distributor: string;
  description: string;
  status: 'pending' | 'ordered' | 'received';
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
  totalAmount: number;
  items: string[]; // IDs of items sold
  createdAt: Date;
  updatedAt: Date;
}

export type ItemFormData = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type RawMaterialFormData = Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>;
export type OrderMaterialFormData = Omit<OrderMaterial, 'id' | 'createdAt' | 'updatedAt'>;
export type SaleFormData = Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'saleId'>;