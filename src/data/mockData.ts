import { Item, RawMaterial, OrderMaterial, Sale } from '../types';

export const mockRawMaterials: RawMaterial[] = [
  {
    id: '1',
    name: 'Dragon Ball Dibujos',
    description: 'Tela de algodón con estampado de Dragon Ball.',
    width: 1.500,
    height: 2.000,
    price: 45.99,
    supplier: 'Textiles Médicos MX',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: '2',
    name: 'Principito Impresión',
    description: 'Tela suave con impresión del Principito.',
    width: 1.200,
    height: 1.800,
    price: 35.50,
    supplier: 'Telas & Diseños',
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2023-12-15')
  },
  {
    id: '3',
    name: 'Tiburón Dental Stone',
    description: 'Tela de algodón con estampado de tiburones.',
    width: 1.000,
    height: 1.500,
    price: 28.75,
    supplier: 'Estampados Creativos',
    createdAt: new Date('2023-12-10'),
    updatedAt: new Date('2023-12-10')
  },
  {
    id: '4',
    name: 'Tela de Pequeña',
    description: 'Tela de algodón liviana con patrón infantil.',
    width: 2.000,
    height: 1.500,
    price: 65.00,
    supplier: 'Confecciones Médicas SA',
    createdAt: new Date('2023-12-12'),
    updatedAt: new Date('2023-12-12')
  },
  {
    id: '5',
    name: 'Snoopy Sticker',
    description: 'Tela con estampado de Snoopy.',
    width: 0.800,
    height: 1.200,
    price: 120.50,
    supplier: 'Médica Textil',
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-15')
  },
  {
    id: '6',
    name: 'Flores Vintage',
    description: 'Tela con diseño floral vintage para gorros elegantes.',
    width: 1.600,
    height: 2.200,
    price: 52.30,
    supplier: 'Textiles Médicos MX',
    createdAt: new Date('2023-12-18'),
    updatedAt: new Date('2023-12-18')
  },
  {
    id: '7',
    name: 'Estrellas Azules',
    description: 'Tela azul con estampado de estrellas blancas.',
    width: 1.400,
    height: 1.900,
    price: 38.90,
    supplier: 'Telas & Diseños',
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2023-12-20')
  }
];

export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Pingüino Básico',
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
    name: 'Dragon Ball Reversible',
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
    name: 'Tiburón Ajustable',
    category: 'completo',
    description: 'Gorro quirúrgico ajustable con estampado divertido de tiburones.',
    quantity: 3,
    price: 4500.00,
    materials: ['3'],
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2023-12-05')
  },
  {
    id: '4',
    name: 'Principito Doble',
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
    name: 'Snoopy Clásico',
    category: 'doble-vista',
    description: 'Gorro quirúrgico reversible con estampado clásico de Snoopy.',
    quantity: 10,
    price: 350.00,
    materials: ['5'],
    createdAt: new Date('2023-12-10'),
    updatedAt: new Date('2023-12-10')
  },
  {
    id: '6',
    name: 'Algodón Natural',
    category: 'sencillo-algodon',
    description: 'Gorro quirúrgico de algodón 100% natural, hipoalergénico.',
    quantity: 30,
    price: 22.50,
    materials: ['4'],
    createdAt: new Date('2023-12-12'),
    updatedAt: new Date('2023-12-12')
  },
  {
    id: '7',
    name: 'Algodón Premium Ajustable',
    category: 'completo-algodon',
    description: 'Gorro quirúrgico completo de algodón premium con ajuste personalizado.',
    quantity: 8,
    price: 89.99,
    materials: ['6'],
    createdAt: new Date('2023-12-14'),
    updatedAt: new Date('2023-12-14')
  },
  {
    id: '8',
    name: 'Stretch Deportivo',
    category: 'stretch',
    description: 'Gorro quirúrgico elástico ideal para procedimientos largos.',
    quantity: 20,
    price: 45.75,
    materials: ['7'],
    createdAt: new Date('2023-12-16'),
    updatedAt: new Date('2023-12-16')
  },
  {
    id: '9',
    name: 'Flores Elegante',
    category: 'completo',
    description: 'Gorro quirúrgico completo con diseño floral elegante.',
    quantity: 12,
    price: 95.00,
    materials: ['6'],
    createdAt: new Date('2023-12-18'),
    updatedAt: new Date('2023-12-18')
  },
  {
    id: '10',
    name: 'Estrellas Stretch',
    category: 'stretch',
    description: 'Gorro quirúrgico elástico con estampado de estrellas.',
    quantity: 18,
    price: 52.30,
    materials: ['7'],
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2023-12-20')
  },
  {
    id: '11',
    name: 'Algodón Básico Azul',
    category: 'sencillo-algodon',
    description: 'Gorro quirúrgico básico de algodón en color azul.',
    quantity: 35,
    price: 19.99,
    materials: ['7'],
    createdAt: new Date('2023-12-22'),
    updatedAt: new Date('2023-12-22')
  },
  {
    id: '12',
    name: 'Premium Completo Algodón',
    category: 'completo-algodon',
    description: 'Gorro quirúrgico premium de algodón con todas las características.',
    quantity: 6,
    price: 110.50,
    materials: ['6', '7'],
    createdAt: new Date('2023-12-24'),
    updatedAt: new Date('2023-12-24')
  }
];

export const mockOrderMaterials: OrderMaterial[] = [
  {
    id: '1',
    materials: [
      {
        designs: [
          { rawMaterialId: '1', height: 2.5, width: 1.5 },
          { rawMaterialId: '2', height: 2.0, width: 1.2 }
        ]
      }
    ],
    distributor: 'Textiles Premium SA',
    description: 'Pedido urgente para restock de telas Dragon Ball y Principito',
    status: 'pending',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    materials: [
      {
        designs: [
          { rawMaterialId: '2', height: 3.0, width: 1.8 }
        ]
      }
    ],
    distributor: 'Distribuidora Textil Norte',
    description: 'Pedido regular mensual de tela Principito',
    status: 'ordered',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '3',
    materials: [
      {
        designs: [
          { rawMaterialId: '4', height: 2.2, width: 1.6 }
        ]
      }
    ],
    distributor: 'Mayorista Telas MX',
    description: 'Pedido especial para temporada alta',
    status: 'received',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18')
  }
];

export const mockSales: Sale[] = [
  {
    id: '1',
    name: 'María González',
    status: 'delivered',
    socialMediaPlatform: 'instagram',
    socialMediaUsername: 'maria_med_style',
    saleId: 'SALE-2024-001',
    trackingNumber: 'EST123456789',
    invoiceRequired: true,
    shippingType: 'nacional',
    nationalShippingCarrier: 'estafeta',
    shippingDescription: 'Entrega en oficina principal',
    totalAmount: 450.00,
    items: ['1', '2'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '2',
    name: 'Dr. Carlos Ruiz',
    status: 'shipped',
    socialMediaPlatform: 'facebook',
    socialMediaUsername: 'carlos.ruiz.medico',
    saleId: 'SALE-2024-002',
    trackingNumber: 'DHL987654321',
    invoiceRequired: false,
    shippingType: 'nacional',
    nationalShippingCarrier: 'dhl',
    shippingDescription: 'Entrega express 24hrs',
    totalAmount: 125.00,
    items: ['4'],
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: '3',
    name: 'Ana Martínez',
    status: 'pending',
    socialMediaPlatform: 'whatsapp',
    socialMediaUsername: '5551234567',
    saleId: 'SALE-2024-003',
    trackingNumber: '',
    invoiceRequired: true,
    shippingType: 'local',
    localShippingOption: 'meeting-point',
    localAddress: 'Plaza Central, Local 15',
    totalAmount: 350.00,
    items: ['5'],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];