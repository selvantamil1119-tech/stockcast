/**
 * Inventory Replenishment & Optimization Service
 * Implements:
 * 1. Economic Order Quantity (EOQ)
 * 2. Reorder Point (ROP)
 * 3. Stock Runway calculation
 * 4. Replenishment Priority & Purchase Order suggestions
 */

/**
 * Calculate EOQ (Economic Order Quantity)
 * @param {number} annualDemand - Estimated annual demand in units
 * @param {number} orderCost - Cost per order (S)
 * @param {number} unitCost - Cost per unit (C)
 * @param {number} holdingCostRate - Holding cost fraction per year (default 20%)
 */
export function calculateEOQ(annualDemand, orderCost = 45, unitCost, holdingCostRate = 0.20) {
  const H = Math.max(0.5, unitCost * holdingCostRate); // Annual holding cost per unit
  const D = Math.max(1, annualDemand);
  const S = Math.max(10, orderCost);

  // EOQ = sqrt( (2 * D * S) / H )
  const eoq = Math.sqrt((2 * D * S) / H);
  return Math.max(5, Math.round(eoq));
}

/**
 * Calculate Reorder Point (ROP)
 * ROP = (Daily Demand * Lead Time) + Safety Stock
 */
export function calculateROP(avgDailyDemand, leadTimeDays = 7, safetyStock = 10) {
  const leadTimeDemand = avgDailyDemand * leadTimeDays;
  return Math.ceil(leadTimeDemand + safetyStock);
}

/**
 * Analyze inventory item and generate replenishment recommendation
 */
export function evaluateReplenishment(product, recentDailySales = []) {
  // Compute average daily demand from recent sales (e.g. past 30 days)
  let avgDailyDemand = 0;
  if (recentDailySales.length > 0) {
    const totalSold = recentDailySales.reduce((acc, s) => acc + s.quantitySold, 0);
    avgDailyDemand = Number((totalSold / Math.max(1, recentDailySales.length)).toFixed(2));
  } else {
    avgDailyDemand = Math.max(1, Number((product.minStockLevel / 7).toFixed(2)));
  }

  const annualDemand = Math.round(avgDailyDemand * 365);
  const leadTime = product.leadTimeDays || 7;
  const safetyStock = product.safetyStock || 10;
  const unitCost = product.unitCost || 10;
  const holdingRate = product.holdingCostRate || 0.20;
  const orderCost = product.orderCost || 45;

  const rop = calculateROP(avgDailyDemand, leadTime, safetyStock);
  const eoq = calculateEOQ(annualDemand, orderCost, unitCost, holdingRate);

  const currentStock = product.currentStock || 0;
  const runwayDays = avgDailyDemand > 0 ? Number((currentStock / avgDailyDemand).toFixed(1)) : 999;

  // Determine replenishment urgency
  let urgency = 'OPTIMAL';
  let suggestedOrderQty = 0;

  if (currentStock <= 0) {
    urgency = 'CRITICAL_STOCKOUT';
    suggestedOrderQty = Math.max(eoq, rop - currentStock + safetyStock);
  } else if (currentStock <= rop) {
    urgency = 'REORDER_NOW';
    suggestedOrderQty = Math.max(eoq, rop - currentStock + safetyStock);
  } else if (runwayDays <= leadTime + 3) {
    urgency = 'WARNING_LOW';
    suggestedOrderQty = eoq;
  } else if (currentStock >= (product.maxStockLevel || 150)) {
    urgency = 'OVERSTOCKED';
    suggestedOrderQty = 0;
  }

  const estimatedOrderCost = Number((suggestedOrderQty * unitCost).toFixed(2));

  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    currentStock,
    avgDailyDemand,
    annualDemand,
    leadTimeDays: leadTime,
    safetyStock,
    rop,
    eoq,
    runwayDays,
    urgency,
    needsReorder: urgency === 'CRITICAL_STOCKOUT' || urgency === 'REORDER_NOW' || urgency === 'WARNING_LOW',
    suggestedOrderQty,
    unitCost,
    estimatedOrderCost,
    supplier: product.supplier || { name: 'Main Supplier' }
  };
}
