import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

// Get high-level analytics & performance metrics
export const getDashboardAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Filter sales within the window and scoped to the user if authenticated
    const salesFilter = { date: { $gte: startDate } };
    if (req.userId) {
      salesFilter.userId = req.userId;
    }

    const sales = await Sale.find(salesFilter).sort({ date: 1 }).lean();

    let totalRevenue = 0;
    let totalCost = 0;
    let totalUnitsSold = 0;

    // Daily revenue & profit aggregation
    const dailyMap = {};
    // Category distribution aggregation
    const categoryMap = {};
    // Product performance map
    const productMap = {};

    sales.forEach(sale => {
      totalRevenue += (sale.revenue || 0);
      totalCost += (sale.cost || 0);
      totalUnitsSold += (sale.quantitySold || 0);

      // Group by date
      const dateKey = new Date(sale.date).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, revenue: 0, profit: 0, units: 0 };
      }
      dailyMap[dateKey].revenue += (sale.revenue || 0);
      dailyMap[dateKey].profit += (sale.profit || 0);
      dailyMap[dateKey].units += (sale.quantitySold || 0);

      // Group by category
      const cat = sale.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + (sale.revenue || 0);

      // Group by product
      if (!productMap[sale.sku]) {
        productMap[sale.sku] = {
          sku: sale.sku,
          name: sale.productName,
          category: sale.category,
          totalRevenue: 0,
          totalUnits: 0,
          totalProfit: 0
        };
      }
      productMap[sale.sku].totalRevenue += (sale.revenue || 0);
      productMap[sale.sku].totalUnits += (sale.quantitySold || 0);
      productMap[sale.sku].totalProfit += (sale.profit || 0);
    });

    const totalProfit = totalRevenue - totalCost;
    const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Format daily timeline
    const salesTimeline = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Category distribution
    const categoryDistribution = Object.entries(categoryMap).map(([category, revenue]) => ({
      category,
      revenue: Number(revenue.toFixed(2))
    }));

    // Top 5 products by revenue
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(p => ({
        ...p,
        totalRevenue: Number(p.totalRevenue.toFixed(2)),
        totalProfit: Number(p.totalProfit.toFixed(2))
      }));

    // Inventory Turnover Ratio calculation
    const prodFilter = req.userId ? { userId: req.userId } : {};
    const products = await Product.find(prodFilter).lean();
    const totalInventoryCost = products.reduce((acc, p) => acc + (p.currentStock * p.unitCost), 0);
    const annualizedCOGS = (totalCost / Math.max(1, days)) * 365;
    const inventoryTurnover = totalInventoryCost > 0
      ? Number((annualizedCOGS / totalInventoryCost).toFixed(2))
      : 0;

    res.json({
      success: true,
      data: {
        windowDays: days,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        grossMarginPercent: Number(overallMargin.toFixed(1)),
        totalUnitsSold,
        inventoryTurnoverRatio: inventoryTurnover,
        salesTimeline,
        categoryDistribution,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record a new sale transaction (and decrement inventory)
export const recordSale = async (req, res) => {
  try {
    const { sku, quantitySold, channel = 'Retail POS' } = req.body;

    const prodFilter = { sku: sku.toUpperCase() };
    if (req.userId) prodFilter.userId = req.userId;

    const product = await Product.findOne(prodFilter);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${sku} not found` });
    }

    const qty = parseInt(quantitySold, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    if (product.currentStock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.currentStock} units available for ${product.name}`
      });
    }

    // Decrement stock
    product.currentStock -= qty;
    await product.save();

    const revenue = Number((qty * product.unitPrice).toFixed(2));
    const cost = Number((qty * product.unitCost).toFixed(2));
    const profit = Number((revenue - cost).toFixed(2));

    const sale = new Sale({
      saleId: `SALE-${Date.now()}`,
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
      message: 'Sale recorded and inventory updated',
      data: sale,
      remainingStock: product.currentStock
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
