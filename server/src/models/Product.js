import mongoose from 'mongoose';
import { createModelAdapter } from './storeAdapter.js';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Apparel', 'Groceries', 'Home & Kitchen', 'Healthcare', 'Office Supplies']
  },
  description: {
    type: String,
    default: ''
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 15
  },
  maxStockLevel: {
    type: Number,
    default: 150
  },
  safetyStock: {
    type: Number,
    default: 10
  },
  leadTimeDays: {
    type: Number,
    default: 7,
    min: 1
  },
  orderCost: {
    type: Number,
    default: 45 // Fixed ordering cost per PO (S in EOQ)
  },
  holdingCostRate: {
    type: Number,
    default: 0.20 // 20% annual inventory holding cost rate (H = unitCost * holdingCostRate)
  },
  supplier: {
    name: { type: String, default: 'Global Prime Supplies' },
    email: { type: String, default: 'orders@primesupplies.com' },
    phone: { type: String, default: '+1 (555) 019-2834' }
  },
  location: {
    type: String,
    default: 'Main Warehouse'
  },
  userId: {
    type: String,
    default: null,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Stock Health Status
productSchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'out_of_stock';
  if (this.currentStock <= (this.minStockLevel || 15)) return 'low_stock';
  if (this.currentStock >= (this.maxStockLevel || 150)) return 'overstocked';
  return 'optimal';
});

// Virtual for Gross Margin %
productSchema.virtual('grossMarginPercent').get(function() {
  if (!this.unitPrice || this.unitPrice === 0) return 0;
  return Number((((this.unitPrice - this.unitCost) / this.unitPrice) * 100).toFixed(1));
});

let MongooseProduct = null;
try {
  MongooseProduct = mongoose.models.Product || mongoose.model('Product', productSchema);
} catch (e) {
  // fallback if mongoose is unavailable
}

const fallbackProduct = createModelAdapter('Product');

const Product = new Proxy(function(data) {
  if (mongoose.connection.readyState === 1 && MongooseProduct) {
    return new MongooseProduct(data);
  }
  return fallbackProduct(data);
}, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1 && MongooseProduct) {
      return MongooseProduct[prop];
    }
    return fallbackProduct[prop];
  }
});

export default Product;
