import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

// Helper to build user-scoped filter
const buildUserFilter = (req, baseFilter = {}) => {
  if (req.userId) {
    return { ...baseFilter, userId: req.userId };
  }
  return baseFilter;
};

// Get all products with filtering & search
export const getProducts = async (req, res) => {
  try {
    const { category, status, search, sort = 'name' } = req.query;
    let filter = buildUserFilter(req);

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort(sort);

    // Apply status filter in memory because status is a virtual
    let filteredProducts = products;
    if (status && status !== 'All') {
      filteredProducts = products.filter(p => p.stockStatus === status);
    }

    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product by SKU
export const getProductBySku = async (req, res) => {
  try {
    const { sku } = req.params;
    const filter = buildUserFilter(req, { sku: sku.toUpperCase() });
    const product = await Product.findOne(filter);

    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${sku} not found` });
    }

    const salesFilter = buildUserFilter(req, { sku: product.sku });
    const recentSales = await Sale.find(salesFilter)
      .sort({ date: -1 })
      .limit(30);

    res.json({
      success: true,
      data: product,
      recentSales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new Product
export const createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      category,
      description,
      unitCost,
      unitPrice,
      currentStock,
      minStockLevel,
      maxStockLevel,
      safetyStock,
      leadTimeDays,
      supplier,
      location
    } = req.body;

    const existingFilter = buildUserFilter(req, { sku: sku.toUpperCase() });
    const existing = await Product.findOne(existingFilter);
    if (existing) {
      return res.status(400).json({ success: false, message: `Product with SKU ${sku} already exists` });
    }

    const product = new Product({
      sku: sku.toUpperCase(),
      name,
      category,
      description,
      unitCost: Number(unitCost),
      unitPrice: Number(unitPrice),
      currentStock: Number(currentStock) || 0,
      minStockLevel: Number(minStockLevel) || 15,
      maxStockLevel: Number(maxStockLevel) || 150,
      safetyStock: Number(safetyStock) || 10,
      leadTimeDays: Number(leadTimeDays) || 7,
      supplier,
      location,
      userId: req.userId || null
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const filter = buildUserFilter(req, { sku: sku.toUpperCase() });
    const product = await Product.findOneAndUpdate(
      filter,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${sku} not found` });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Adjust stock level (add restock or record shrinkage)
export const adjustStock = async (req, res) => {
  try {
    const { sku } = req.params;
    const { quantity, reason = 'Adjustment', type = 'add' } = req.body;

    const filter = buildUserFilter(req, { sku: sku.toUpperCase() });
    const product = await Product.findOne(filter);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${sku} not found` });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity required' });
    }

    if (type === 'subtract' && product.currentStock - qty < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot drop below zero' });
    }

    product.currentStock = type === 'add'
      ? product.currentStock + qty
      : product.currentStock - qty;

    await product.save();

    res.json({
      success: true,
      message: `Stock adjusted successfully (${type} ${qty})`,
      currentStock: product.currentStock,
      stockStatus: product.stockStatus,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const filter = buildUserFilter(req, { sku: sku.toUpperCase() });
    const product = await Product.findOneAndDelete(filter);

    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${sku} not found` });
    }

    res.json({
      success: true,
      message: `Product ${sku} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Summary metrics for KPI Cards
export const getInventorySummary = async (req, res) => {
  try {
    const filter = buildUserFilter(req);
    const products = await Product.find(filter);

    let totalStockValue = 0;
    let totalRetailValue = 0;
    let totalUnitsInStock = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let optimalCount = 0;
    let overstockedCount = 0;

    products.forEach(p => {
      const stock = p.currentStock || 0;
      totalUnitsInStock += stock;
      totalStockValue += stock * (p.unitCost || 0);
      totalRetailValue += stock * (p.unitPrice || 0);

      const status = p.stockStatus;
      if (status === 'out_of_stock') outOfStockCount++;
      else if (status === 'low_stock') lowStockCount++;
      else if (status === 'overstocked') overstockedCount++;
      else optimalCount++;
    });

    const categoryBreakdown = {};
    products.forEach(p => {
      if (!categoryBreakdown[p.category]) {
        categoryBreakdown[p.category] = { count: 0, stockValue: 0, totalUnits: 0 };
      }
      categoryBreakdown[p.category].count += 1;
      categoryBreakdown[p.category].stockValue += (p.currentStock * p.unitCost);
      categoryBreakdown[p.category].totalUnits += p.currentStock;
    });

    res.json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalUnitsInStock,
        totalStockValue: Number(totalStockValue.toFixed(2)),
        totalRetailValue: Number(totalRetailValue.toFixed(2)),
        potentialProfit: Number((totalRetailValue - totalStockValue).toFixed(2)),
        outOfStockCount,
        lowStockCount,
        optimalCount,
        overstockedCount,
        stockHealthScore: products.length > 0
          ? Math.round((optimalCount / products.length) * 100)
          : 100,
        categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
