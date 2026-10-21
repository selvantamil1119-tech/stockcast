import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

export const sampleProducts = [
  // --- Electronics ---
  {
    sku: 'ELEC-101',
    name: 'Wireless Noise-Canceling Headphones',
    category: 'Electronics',
    description: 'Over-ear active noise cancelling Bluetooth 5.3 headphones.',
    unitCost: 55.00,
    unitPrice: 129.99,
    currentStock: 8, // Low Stock (ROP trigger!)
    minStockLevel: 20,
    maxStockLevel: 120,
    safetyStock: 15,
    leadTimeDays: 7,
    orderCost: 50,
    holdingCostRate: 0.18,
    supplier: { name: 'AcousticTech Shenzen Ltd', email: 'sales@acoustictech.com', phone: '+1 800-492-3849' },
    location: 'Warehouse A - Bin E12'
  },
  {
    sku: 'ELEC-102',
    name: 'Smart Fitness Tracker Watch Pro',
    category: 'Electronics',
    description: 'Heart rate, SpO2, GPS tracking waterproof smartwatch.',
    unitCost: 35.00,
    unitPrice: 89.99,
    currentStock: 0, // CRITICAL STOCKOUT!
    minStockLevel: 15,
    maxStockLevel: 100,
    safetyStock: 12,
    leadTimeDays: 10,
    orderCost: 45,
    holdingCostRate: 0.20,
    supplier: { name: 'SmartFit Devices Corp', email: 'b2b@smartfit.io', phone: '+1 888-555-0143' },
    location: 'Warehouse A - Bin E15'
  },
  {
    sku: 'ELEC-103',
    name: '15W Fast Magnetic Wireless Charger',
    category: 'Electronics',
    description: 'Qi-certified slim magnetic desk charging pad.',
    unitCost: 9.50,
    unitPrice: 29.99,
    currentStock: 64, // Optimal
    minStockLevel: 25,
    maxStockLevel: 150,
    safetyStock: 20,
    leadTimeDays: 5,
    orderCost: 35,
    holdingCostRate: 0.15,
    supplier: { name: 'AcousticTech Shenzen Ltd', email: 'sales@acoustictech.com', phone: '+1 800-492-3849' },
    location: 'Warehouse A - Bin E03'
  },
  {
    sku: 'ELEC-104',
    name: 'Compact 4K Streaming Webcam',
    category: 'Electronics',
    description: 'Ultra HD 4K webcam with dual stereo noise-reducing microphones.',
    unitCost: 28.00,
    unitPrice: 69.99,
    currentStock: 180, // OVERSTOCKED!
    minStockLevel: 20,
    maxStockLevel: 100,
    safetyStock: 15,
    leadTimeDays: 6,
    orderCost: 40,
    holdingCostRate: 0.22,
    supplier: { name: 'VisionMedia Tech', email: 'orders@visionmedia.com', phone: '+1 800-998-1212' },
    location: 'Warehouse A - Bin E22'
  },

  // --- Apparel ---
  {
    sku: 'APP-201',
    name: 'Organic Cotton Classic Crewneck Tee',
    category: 'Apparel',
    description: '100% GOTS certified combed organic cotton unisex t-shirt.',
    unitCost: 6.50,
    unitPrice: 24.50,
    currentStock: 140, // Optimal
    minStockLevel: 40,
    maxStockLevel: 250,
    safetyStock: 30,
    leadTimeDays: 12,
    orderCost: 60,
    holdingCostRate: 0.15,
    supplier: { name: 'EcoThreads Manufacturing', email: 'wholesale@ecothreads.org', phone: '+1 877-332-9011' },
    location: 'Warehouse B - Rack T04'
  },
  {
    sku: 'APP-202',
    name: 'Performance Stretch Chino Trousers',
    category: 'Apparel',
    description: 'Wrinkle-resistant 4-way stretch breathable chinos.',
    unitCost: 18.00,
    unitPrice: 58.00,
    currentStock: 12, // Low Stock
    minStockLevel: 25,
    maxStockLevel: 120,
    safetyStock: 15,
    leadTimeDays: 14,
    orderCost: 55,
    holdingCostRate: 0.18,
    supplier: { name: 'EcoThreads Manufacturing', email: 'wholesale@ecothreads.org', phone: '+1 877-332-9011' },
    location: 'Warehouse B - Rack P09'
  },
  {
    sku: 'APP-203',
    name: 'Waterproof Ultralight Trail Jacket',
    category: 'Apparel',
    description: 'Packable ripstop nylon hooded outdoor jacket.',
    unitCost: 32.00,
    unitPrice: 95.00,
    currentStock: 45, // Optimal
    minStockLevel: 15,
    maxStockLevel: 80,
    safetyStock: 10,
    leadTimeDays: 15,
    orderCost: 65,
    holdingCostRate: 0.20,
    supplier: { name: 'PeakOutdoors Gear Co', email: 'supply@peakoutdoors.com', phone: '+1 800-441-8902' },
    location: 'Warehouse B - Rack J02'
  },

  // --- Groceries ---
  {
    sku: 'GROC-301',
    name: 'Artisan Cold Brew Coffee (12-Pack)',
    category: 'Groceries',
    description: 'Single-origin Colombian steep cold brew in 250ml cans.',
    unitCost: 14.00,
    unitPrice: 32.00,
    currentStock: 6, // Low Stock / Critical
    minStockLevel: 25,
    maxStockLevel: 160,
    safetyStock: 18,
    leadTimeDays: 4,
    orderCost: 30,
    holdingCostRate: 0.25,
    supplier: { name: 'Apex Beverage Dist.', email: 'orders@apexbev.com', phone: '+1 800-221-9988' },
    location: 'Warehouse C - ColdZone 1'
  },
  {
    sku: 'GROC-302',
    name: 'Organic Raw California Almonds 1kg',
    category: 'Groceries',
    description: 'Unsalted non-GMO pasteurized whole natural almonds.',
    unitCost: 7.20,
    unitPrice: 16.99,
    currentStock: 85, // Optimal
    minStockLevel: 30,
    maxStockLevel: 200,
    safetyStock: 25,
    leadTimeDays: 5,
    orderCost: 25,
    holdingCostRate: 0.20,
    supplier: { name: 'SunValley Naturals', email: 'dispatch@sunvalleynuts.com', phone: '+1 800-771-3321' },
    location: 'Warehouse C - Aisle G03'
  },
  {
    sku: 'GROC-303',
    name: 'Single Estate Extra Virgin Olive Oil 750ml',
    category: 'Groceries',
    description: 'Cold pressed unfiltered Greek Koroneiki olive oil.',
    unitCost: 9.80,
    unitPrice: 22.50,
    currentStock: 240, // OVERSTOCKED!
    minStockLevel: 30,
    maxStockLevel: 140,
    safetyStock: 20,
    leadTimeDays: 8,
    orderCost: 40,
    holdingCostRate: 0.18,
    supplier: { name: 'SunValley Naturals', email: 'dispatch@sunvalleynuts.com', phone: '+1 800-771-3321' },
    location: 'Warehouse C - Aisle G07'
  },

  // --- Home & Kitchen ---
  {
    sku: 'HOME-401',
    name: 'Ergonomic LED Dual-Tone Desk Lamp',
    category: 'Home & Kitchen',
    description: 'Eye-caring dimmer lamp with USB-C passthrough charging.',
    unitCost: 16.50,
    unitPrice: 42.00,
    currentStock: 52, // Optimal
    minStockLevel: 15,
    maxStockLevel: 90,
    safetyStock: 12,
    leadTimeDays: 7,
    orderCost: 35,
    holdingCostRate: 0.16,
    supplier: { name: 'Lumina Living Goods', email: 'support@luminaliving.com', phone: '+1 888-294-0199' },
    location: 'Warehouse D - Shelf H05'
  },
  {
    sku: 'HOME-402',
    name: 'HEPA True Air Purifier Replacement Filter',
    category: 'Home & Kitchen',
    description: 'H13 medical grade carbon active composite filter.',
    unitCost: 11.00,
    unitPrice: 29.99,
    currentStock: 5, // Low stock
    minStockLevel: 20,
    maxStockLevel: 100,
    safetyStock: 15,
    leadTimeDays: 6,
    orderCost: 30,
    holdingCostRate: 0.15,
    supplier: { name: 'Lumina Living Goods', email: 'support@luminaliving.com', phone: '+1 888-294-0199' },
    location: 'Warehouse D - Shelf H11'
  },

  // --- Healthcare ---
  {
    sku: 'HLTH-501',
    name: 'Non-Contact Infrared Forehead Thermometer',
    category: 'Healthcare',
    description: 'Instant clinical precision digital medical thermometer.',
    unitCost: 12.00,
    unitPrice: 34.99,
    currentStock: 38, // Optimal
    minStockLevel: 15,
    maxStockLevel: 80,
    safetyStock: 10,
    leadTimeDays: 5,
    orderCost: 40,
    holdingCostRate: 0.15,
    supplier: { name: 'Medix Health Supplies', email: 'orders@medixhealth.com', phone: '+1 800-511-7654' },
    location: 'Warehouse E - MedSec A'
  },
  {
    sku: 'HLTH-502',
    name: 'Elderberry Zinc Multivitamin Gummies (90 ct)',
    category: 'Healthcare',
    description: 'Immune support dietary supplement gummies.',
    unitCost: 5.50,
    unitPrice: 18.99,
    currentStock: 1, // Critical Near-Stockout!
    minStockLevel: 30,
    maxStockLevel: 150,
    safetyStock: 25,
    leadTimeDays: 9,
    orderCost: 35,
    holdingCostRate: 0.22,
    supplier: { name: 'Medix Health Supplies', email: 'orders@medixhealth.com', phone: '+1 800-511-7654' },
    location: 'Warehouse E - MedSec C'
  }
];

export async function seedDatabase() {
  console.log('🌱 Starting retail data seeding...');

  // Clear existing collections
  await Product.deleteMany({});
  await Sale.deleteMany({});
  await PurchaseOrder.deleteMany({});

  // 1. Insert Products
  const createdProducts = await Product.insertMany(sampleProducts);
  console.log(`✅ Seeded ${createdProducts.length} retail products.`);

  // 2. Generate 90 days of sales history for each product
  const salesToInsert = [];
  const channels = ['Retail POS', 'Online Store', 'Retail POS', 'Direct B2B', 'Retail POS'];
  const today = new Date();

  createdProducts.forEach(product => {
    // Determine daily baseline sales rate based on category & price
    let baseQty = 3;
    if (product.category === 'Groceries') baseQty = 8;
    else if (product.category === 'Apparel') baseQty = 4;
    else if (product.category === 'Electronics') baseQty = 3;
    else baseQty = 2;

    for (let dayOffset = 90; dayOffset >= 1; dayOffset--) {
      const saleDate = new Date(today);
      saleDate.setDate(today.getDate() - dayOffset);

      const dayOfWeek = saleDate.getDay();
      // Weekend bump (+40% on Fri/Sat/Sun)
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) ? 1.4 : 1.0;
      // Slight upward growth trend over 90 days
      const trendMultiplier = 1 + ((90 - dayOffset) / 180);
      // Random noise (-30% to +30%)
      const noise = 0.7 + Math.random() * 0.6;

      const dailyUnits = Math.max(1, Math.round(baseQty * weekendMultiplier * trendMultiplier * noise));

      // Create 1-2 transactions per day
      const txnRevenue = Number((dailyUnits * product.unitPrice).toFixed(2));
      const txnCost = Number((dailyUnits * product.unitCost).toFixed(2));
      const txnProfit = Number((txnRevenue - txnCost).toFixed(2));

      salesToInsert.push({
        saleId: `TXN-${saleDate.getTime()}-${product.sku}`,
        sku: product.sku,
        productName: product.name,
        category: product.category,
        date: saleDate,
        quantitySold: dailyUnits,
        unitPrice: product.unitPrice,
        unitCost: product.unitCost,
        revenue: txnRevenue,
        cost: txnCost,
        profit: txnProfit,
        channel: channels[Math.floor(Math.random() * channels.length)]
      });
    }
  });

  await Sale.insertMany(salesToInsert);
  console.log(`✅ Seeded ${salesToInsert.length} historical sales records (90 days).`);

  // 3. Seed sample active Purchase Orders
  const samplePOs = [
    {
      orderNumber: 'PO-984210',
      supplier: {
        name: 'AcousticTech Shenzen Ltd',
        email: 'sales@acoustictech.com',
        phone: '+1 800-492-3849'
      },
      items: [
        {
          sku: 'ELEC-101',
          name: 'Wireless Noise-Canceling Headphones',
          quantity: 50,
          unitCost: 55.00,
          totalCost: 2750.00
        }
      ],
      totalAmount: 2750.00,
      status: 'In Transit',
      orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      notes: 'Urgent restock to avoid out-of-stock weekend'
    },
    {
      orderNumber: 'PO-984180',
      supplier: {
        name: 'Apex Beverage Dist.',
        email: 'orders@apexbev.com',
        phone: '+1 800-221-9988'
      },
      items: [
        {
          sku: 'GROC-301',
          name: 'Artisan Cold Brew Coffee (12-Pack)',
          quantity: 80,
          unitCost: 14.00,
          totalCost: 1120.00
        }
      ],
      totalAmount: 1120.00,
      status: 'Ordered',
      orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'EOQ restock based on summer surge'
    }
  ];

  await PurchaseOrder.insertMany(samplePOs);
  console.log(`✅ Seeded ${samplePOs.length} active purchase orders.`);
  console.log('✨ Data seeding complete!');
}
