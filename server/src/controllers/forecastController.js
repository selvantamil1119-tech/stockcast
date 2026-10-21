import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { generateForecastSeries } from '../services/forecastService.js';

// Get forecast for a specific product SKU
export const getProductForecast = async (req, res) => {
  try {
    const { sku } = req.params;
    const horizon = parseInt(req.query.horizon, 10) || 30;
    const method = req.query.method || 'holt_smoothing';

    const prodFilter = { sku: sku.toUpperCase() };
    if (req.userId) prodFilter.userId = req.userId;

    const product = await Product.findOne(prodFilter);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${sku} not found in your catalog` });
    }

    // Fetch past 90 days of daily sales for this SKU
    const salesFilter = { sku: product.sku };
    if (req.userId) salesFilter.userId = req.userId;

    const salesRecords = await Sale.find(salesFilter)
      .sort({ date: 1 })
      .lean();

    // Group sales by day (in case there are multiple sales on the same day)
    const dailyMap = new Map();
    salesRecords.forEach(s => {
      const dayStr = new Date(s.date).toISOString().split('T')[0];
      dailyMap.set(dayStr, (dailyMap.get(dayStr) || 0) + (s.quantitySold || 0));
    });

    const historicalDaily = Array.from(dailyMap.entries()).map(([date, quantity]) => ({
      date,
      quantity
    }));

    // If historical data is sparse, ensure at least some points based on product parameters
    if (historicalDaily.length === 0) {
      const baseDaily = Math.max(1, Math.round((product.minStockLevel || 15) / 5));
      for (let i = 30; i >= 1; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        historicalDaily.push({
          date: d.toISOString().split('T')[0],
          quantity: Math.max(0, baseDaily + Math.floor(Math.sin(i) * 2))
        });
      }
    }

    const forecast = generateForecastSeries(historicalDaily, horizon, method);

    // Calculate Projected Days Until Stockout
    let remainingStock = product.currentStock;
    let daysUntilStockout = null;
    let projectedStockoutDate = null;

    for (let i = 0; i < forecast.forecastItems.length; i++) {
      const dayDemand = forecast.forecastItems[i].predictedDemand;
      remainingStock -= dayDemand;
      if (remainingStock <= 0 && daysUntilStockout === null) {
        daysUntilStockout = i + 1;
        projectedStockoutDate = forecast.forecastItems[i].date;
        break;
      }
    }

    // Out-of-stock risk status
    let stockoutRisk = 'LOW';
    if (product.currentStock <= 0) {
      stockoutRisk = 'CRITICAL_STOCKOUT';
    } else if (daysUntilStockout !== null && daysUntilStockout <= product.leadTimeDays) {
      stockoutRisk = 'IMMINENT_STOCKOUT'; // will run out before supplier can deliver!
    } else if (daysUntilStockout !== null && daysUntilStockout <= 14) {
      stockoutRisk = 'MODERATE';
    }

    res.json({
      success: true,
      product: {
        sku: product.sku,
        name: product.name,
        category: product.category,
        currentStock: product.currentStock,
        leadTimeDays: product.leadTimeDays,
        minStockLevel: product.minStockLevel,
        safetyStock: product.safetyStock
      },
      forecast: {
        ...forecast,
        daysUntilStockout: daysUntilStockout !== null ? daysUntilStockout : '> 90 days',
        projectedStockoutDate,
        stockoutRisk
      },
      historicalSales: historicalDaily.slice(-30) // last 30 days for visual chart continuity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Stockout Risk Overview across all inventory
export const getStockoutRiskOverview = async (req, res) => {
  try {
    const prodFilter = req.userId ? { userId: req.userId } : {};
    const products = await Product.find(prodFilter).lean();
    const riskItems = [];

    for (const product of products) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesFilter = {
        sku: product.sku,
        date: { $gte: thirtyDaysAgo }
      };
      if (req.userId) salesFilter.userId = req.userId;

      const recentSales = await Sale.find(salesFilter).lean();

      const totalSold = recentSales.reduce((sum, s) => sum + (s.quantitySold || 0), 0);
      const avgDailyDemand = Number((totalSold / 30).toFixed(2)) || 1;
      const runwayDays = Number((product.currentStock / avgDailyDemand).toFixed(1));

      let riskLevel = 'LOW';
      if (product.currentStock <= 0) {
        riskLevel = 'STOCKOUT';
      } else if (runwayDays <= product.leadTimeDays) {
        riskLevel = 'CRITICAL';
      } else if (runwayDays <= 14) {
        riskLevel = 'MODERATE';
      }

      riskItems.push({
        sku: product.sku,
        name: product.name,
        category: product.category,
        currentStock: product.currentStock,
        avgDailyDemand,
        leadTimeDays: product.leadTimeDays,
        runwayDays,
        riskLevel
      });
    }

    // Sort by most urgent first
    const urgencyOrder = { STOCKOUT: 0, CRITICAL: 1, MODERATE: 2, LOW: 3 };
    riskItems.sort((a, b) => urgencyOrder[a.riskLevel] - urgencyOrder[b.riskLevel]);

    res.json({
      success: true,
      data: riskItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
