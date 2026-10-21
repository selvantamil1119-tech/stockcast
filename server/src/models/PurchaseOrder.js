import mongoose from 'mongoose';
import { createModelAdapter } from './storeAdapter.js';

const poItemSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 }
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  supplier: {
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  items: [poItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Ordered', 'In Transit', 'Received', 'Cancelled'],
    default: 'Ordered'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  receivedDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: null,
    index: true
  }
}, {
  timestamps: true
});

let MongoosePO = null;
try {
  MongoosePO = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);
} catch (e) {
  // fallback
}

const fallbackPO = createModelAdapter('PurchaseOrder');

const PurchaseOrder = new Proxy(function(data) {
  if (mongoose.connection.readyState === 1 && MongoosePO) {
    return new MongoosePO(data);
  }
  return fallbackPO(data);
}, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1 && MongoosePO) {
      return MongoosePO[prop];
    }
    return fallbackPO[prop];
  }
});

export default PurchaseOrder;
