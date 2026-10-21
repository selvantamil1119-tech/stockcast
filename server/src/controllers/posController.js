import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

export const recordPosSale = async (req, res) => {
  try {
    const { sku, quantity, channel = 'Retail POS' } = req.body;

    if (!sku) {
      return res.status(400).json({ success: false, message: 'SKU is required' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    const query = { sku: sku.toUpperCase() };
    if (req.userId) query.userId = req.userId;

    let product = await Product.findOne(query);
    if (!product && req.userId) {
      // Fallback: check global product catalogue if not customized per user
      product = await Product.findOne({ sku: sku.toUpperCase() });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: `Product with SKU ${sku} not found` });
    }

    if (product.currentStock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}. Current stock: ${product.currentStock}, requested: ${qty}`
      });
    }

    product.currentStock -= qty;
    await product.save();

    const revenue = Number((qty * product.unitPrice).toFixed(2));
    const cost = Number((qty * product.unitCost).toFixed(2));
    const profit = Number((revenue - cost).toFixed(2));

    const sale = new Sale({
      saleId: `POS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku: product.sku,
      productName: product.name,
      category: product.category,
      date: new Date(),
      quantitySold: qty,
      unitPrice: product.unitPrice,
      unitCost: product.unitCost,
      revenue,
      cost,
      profit,
      channel,
      userId: req.userId || null
    });

    await sale.save();

    res.status(201).json({
      success: true,
      message: 'POS Sale recorded and inventory decremented in real-time',
      sale: {
        saleId: sale.saleId,
        sku: product.sku,
        productName: product.name,
        quantitySold: qty,
        unitPrice: product.unitPrice,
        totalRevenue: revenue,
        remainingStock: product.currentStock,
        stockStatus: product.stockStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkStock = async (req, res) => {
  try {
    const { sku } = req.query;

    if (!sku) {
      return res.status(400).json({ success: false, message: 'SKU query parameter is required (?sku=ELEC-101)' });
    }

    const query = { sku: sku.toUpperCase() };
    if (req.userId) query.userId = req.userId;

    let product = await Product.findOne(query);
    if (!product && req.userId) {
      product = await Product.findOne({ sku: sku.toUpperCase() });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: `Product with SKU ${sku} not found` });
    }

    res.json({
      success: true,
      sku: product.sku,
      name: product.name,
      currentStock: product.currentStock,
      unitPrice: product.unitPrice,
      stockStatus: product.stockStatus,
      reorderPoint: product.minStockLevel
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const posHealthCheck = async (req, res) => {
  res.json({
    status: 'connected',
    businessName: req.user?.businessName || 'StockCast Retail Store',
    businessType: req.user?.businessType || 'Retail Store',
    timestamp: new Date().toISOString()
  });
};
