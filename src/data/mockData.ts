import { Item, RawMaterial } from '../types';

const unitRawMaterial = "m²";
export const mockRawMaterials: RawMaterial[] = [
  {
    id: '1',
    name: 'Dragon Ball Dibujos',
    description: 'Tela de algodón con estampado de Dragon Ball.',
    quantity: 50,
    unit: unitRawMaterial,
    price: 45.99,
    supplier: 'Textiles Médicos MX',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: '2',
    name: 'Principito Impresión',
    description: 'Tela suave con impresión del Principito.',
    quantity: 20,
    unit: unitRawMaterial,
    price: 35.50,
    supplier: 'Telas & Diseños',
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2023-12-15')
  },
  {
    id: '3',
    name: 'Tiburón Dental Stone',
    description: 'Tela de algodón con estampado de tiburones.',
    quantity: 15,
    unit: unitRawMaterial,
    price: 28.75,
    supplier: 'Estampados Creativos',
    createdAt: new Date('2023-12-10'),
    updatedAt: new Date('2023-12-10')
  },
  {
    id: '4',
    name: 'Tela de Pequeña',
    description: 'Tela de algodón liviana con patrón infantil.',
    quantity: 30,
    unit: unitRawMaterial,
    price: 65.00,
    supplier: 'Confecciones Médicas SA',
    createdAt: new Date('2023-12-12'),
    updatedAt: new Date('2023-12-12')
  },
  {
    id: '5',
    name: 'Snoopy Sticker',
    description: 'Tela con estampado de Snoopy.',
    quantity: 12,
    unit: unitRawMaterial,
    price: 120.50,
    supplier: 'Médica Textil',
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-15')
  }
];


export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Pingüino',
    category: 'sencillo',
    description: 'Gorro quirúrgico sencillo con estampado infantil de pingüinos.',
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
    description: 'Gorro quirúrgico reversible con diseño de Dragon Ball.',
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
    description: 'Gorro quirúrgico ajustable con estampado divertido de tiburones.',
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
    description: 'Gorro quirúrgico reversible con ilustraciones del Principito.',
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
    description: 'Gorro quirúrgico reversible con estampado clásico de Snoopy.',
    quantity: 10,
    price: 350.00,
    materials: ['5'],
    createdAt: new Date('2023-12-10'),
    updatedAt: new Date('2023-12-10')
  }
];
