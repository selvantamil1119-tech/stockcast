import mongoose from 'mongoose';
import { createModelAdapter } from './storeAdapter.js';

const saleSchema = new mongoose.Schema({
  saleId: {
    type: String,
    required: true,
    unique: true
  },
  sku: {
    type: String,
    required: true,
    index: true,
    uppercase: true
  },
  productName: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  quantitySold: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    required: true
  },
  revenue: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  channel: {
    type: String,
    enum: ['Online Store', 'Retail POS', 'Direct B2B'],
    default: 'Retail POS'
  },
  userId: {
    type: String,
    default: null,
    index: true
  }
}, {
  timestamps: true
});

let MongooseSale = null;
try {
  MongooseSale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
} catch (e) {
  // fallback if schema compilation
}

const fallbackSale = createModelAdapter('Sale');

const Sale = new Proxy(function(data) {
  if (mongoose.connection.readyState === 1 && MongooseSale) {
    return new MongooseSale(data);
  }
  return fallbackSale(data);
}, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1 && MongooseSale) {
      return MongooseSale[prop];
    }
    return fallbackSale[prop];
  }
});

export default Sale;
