import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { evaluateReplenishment } from '../services/replenishmentService.js';

// Get replenishment recommendations for all products
export const getReplenishmentRecommendations = async (req, res) => {
  try {
    const prodFilter = req.userId ? { userId: req.userId } : {};
    const products = await Product.find(prodFilter).lean();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recommendations = [];

    for (const product of products) {
      const salesFilter = {
        sku: product.sku,
        date: { $gte: thirtyDaysAgo }
      };
      if (req.userId) salesFilter.userId = req.userId;

      const sales = await Sale.find(salesFilter).lean();
      const analysis = evaluateReplenishment(product, sales);
      recommendations.push(analysis);
    }

    // Sort: Critical first, then Reorder Now, then Warning
    const orderPriority = {
      CRITICAL_STOCKOUT: 0,
      REORDER_NOW: 1,
      WARNING_LOW: 2,
      OPTIMAL: 3,
      OVERSTOCKED: 4
    };

    recommendations.sort((a, b) => (orderPriority[a.urgency] ?? 5) - (orderPriority[b.urgency] ?? 5));

    const reorderCount = recommendations.filter(r => r.needsReorder).length;
    const totalRestockInvestment = recommendations
      .filter(r => r.needsReorder)
      .reduce((sum, r) => sum + (r.estimatedOrderCost || 0), 0);

    res.json({
      success: true,
      summary: {
        totalEvaluated: recommendations.length,
        itemsRequiringAction: reorderCount,
        estimatedTotalCapitalRequired: Number(totalRestockInvestment.toFixed(2))
      },
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a Purchase Order
export const createPurchaseOrder = async (req, res) => {
  try {
    const { items, supplierName, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'PO must have at least one item' });
    }

    let calculatedTotal = 0;
    const poItems = [];

    for (const item of items) {
      const prodFilter = { sku: item.sku };
      if (req.userId) prodFilter.userId = req.userId;

      const product = await Product.findOne(prodFilter);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.sku} not found` });
      }

      const qty = parseInt(item.quantity, 10);
      const cost = product.unitCost;
      const total = Number((qty * cost).toFixed(2));
      calculatedTotal += total;

      poItems.push({
        sku: product.sku,
        name: product.name,
        quantity: qty,
        unitCost: cost,
        totalCost: total
      });
    }

    const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 7);

    const purchaseOrder = new PurchaseOrder({
      orderNumber,
      supplier: {
        name: supplierName || 'Global Prime Supplies'
      },
      items: poItems,
      totalAmount: calculatedTotal,
      status: 'Ordered',
      expectedDeliveryDate: expectedDelivery,
      notes: notes || 'Automated replenishment order',
      userId: req.userId || null
    });

    await purchaseOrder.save();

    res.status(201).json({
      success: true,
      message: `Purchase Order ${orderNumber} created successfully`,
      data: purchaseOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Purchase Orders
export const getPurchaseOrders = async (req, res) => {
  try {
    const poFilter = req.userId ? { userId: req.userId } : {};
    const orders = await PurchaseOrder.find(poFilter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Receive Purchase Order (Increments product inventory automatically!)
export const receivePurchaseOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const poFilter = { orderNumber };
    if (req.userId) poFilter.userId = req.userId;

    const po = await PurchaseOrder.findOne(poFilter);
    if (!po) {
      return res.status(404).json({ success: false, message: `Purchase Order ${orderNumber} not found` });
    }

    if (po.status === 'Received') {
      return res.status(400).json({ success: false, message: `PO ${orderNumber} has already been received` });
    }

    // Update stock for all items
    for (const item of po.items) {
      const prodFilter = { sku: item.sku };
      if (req.userId) prodFilter.userId = req.userId;

      await Product.findOneAndUpdate(
        prodFilter,
        { $inc: { currentStock: item.quantity } }
      );
    }

    po.status = 'Received';
    po.receivedDate = new Date();
    await po.save();

    res.json({
      success: true,
      message: `Purchase Order ${orderNumber} received. Stock levels updated!`,
      data: po
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
