import { Item, RawMaterial } from '../types';

const unitRawMaterial = "m²";
export const mockRawMaterials: RawMaterial[] = [
  {
    id: '1',
    name: 'Dragon Ball Dibujos',
    description: 'High-quality dental composite for restorations',
    quantity: 50,
    unit: unitRawMaterial,
    price: 45.99,
    supplier: 'Dental Supply Co.',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: '2',
    name: 'Principito Impresión',
    description: 'Impression material for dental molds',
    quantity: 20,
    unit: unitRawMaterial,
    price: 35.50,
    supplier: 'ProDental Supplies',
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2023-12-15')
  },
  {
    id: '3',
    name: 'Tiburón Dental Stone',
    description: 'Dental stone for models',
    quantity: 15,
    unit: unitRawMaterial,
    price: 28.75,
    supplier: 'Dental Materials Inc.',
    createdAt: new Date('2023-12-10'),
    updatedAt: new Date('2023-12-10')
  },
  {
    id: '4',
    name: 'Tela de Pequña',
    description: 'For denture fabrication',
    quantity: 30,
    unit: unitRawMaterial,
    price: 65.00,
    supplier: 'Dental Works',
    createdAt: new Date('2023-12-12'),
    updatedAt: new Date('2023-12-12')
  },
  {
    id: '5',
    name: 'Snoopy Sticker',
    description: 'For ceramic dental restorations',
    quantity: 12,
    unit: unitRawMaterial,
    price: 120.50,
    supplier: 'Crown Masters',
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-15')
  }
];

export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Pingüino',
    category: 'sencillo',
    description: 'Standard dental examination mirror',
    quantity: 25,
    price: 18.50,
    materials: ['4'],
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: '2',
    name: 'Dragon Ball',
    category: 'doble-vista',
    description: 'Tooth-colored filling material',
    quantity: 40,
    price: 75.99,
    materials: ['1'],
    createdAt: new Date('2023-12-03'),
    updatedAt: new Date('2023-12-03')
  },
  {
    id: '3',
    name: 'Tiburón',
    category: 'completo-ajustable',
    description: 'Electric dental examination chair',
    quantity: 3,
    price: 4500.00,
    materials: [],
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2023-12-05')
  },
  {
    id: '4',
    name: 'Principito',
    category: 'doble-vista',
    description: 'Complete dental impression set',
    quantity: 15,
    price: 125.00,
    materials: ['2', '3'],
    createdAt: new Date('2023-12-07'),
    updatedAt: new Date('2023-12-07')
  },
  {
    id: '5',
    name: 'Snoopy',
    category: 'doble-vista',
    description: 'Porcelain crown for molars',
    quantity: 10,
    price: 350.00,
    materials: ['5'],
    createdAt: new Date('2023-12-10'),
    updatedAt: new Date('2023-12-10')
  }
];