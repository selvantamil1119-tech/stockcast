import mongoose from 'mongoose';
import { createModelAdapter } from './storeAdapter.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessAddress: {
    type: String,
    default: ''
  },
  businessPhone: {
    type: String,
    default: ''
  },
  gstNumber: {
    type: String,
    default: ''
  },
  businessType: {
    type: String,
    enum: ['Retail Store', 'Wholesale', 'E-Commerce', 'Supermarket', 'Other'],
    default: 'Retail Store'
  },
  apiKey: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

let MongooseUser = null;
try {
  MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);
} catch (e) {
  // fallback if mongoose is unavailable
}

const fallbackUser = createModelAdapter('User');

const User = new Proxy(function(data) {
  if (mongoose.connection.readyState === 1 && MongooseUser) {
    return new MongooseUser(data);
  }
  return fallbackUser(data);
}, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1 && MongooseUser) {
      return MongooseUser[prop];
    }
    return fallbackUser[prop];
  }
});

export default User;
