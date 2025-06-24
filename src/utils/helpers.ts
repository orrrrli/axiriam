import { RawMaterial } from "../types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const generateSaleId = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SALE-${year}-${randomNum}`;
};

export const getMaterialsById = (materialIds: string[], allMaterials: RawMaterial[]): RawMaterial[] => {
  return allMaterials.filter(material => materialIds.includes(material.id));
};

export const getLowStockItems = (threshold: number, items: { quantity: number }[]): number => {
  return items.filter(item => item.quantity <= threshold).length;
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'ordered':
    case 'shipped':
      return 'primary';
    case 'received':
    case 'delivered':
      return 'success';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'ordered':
      return 'Ordenado';
    case 'received':
      return 'Recibido';
    case 'shipped':
      return 'Enviado';
    case 'delivered':
      return 'Entregado';
    default:
      return status;
  }
};