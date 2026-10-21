import mongoose from 'mongoose';
import Product from './models/Product.js';
import { seedDatabase } from './utils/dataSeeder.js';

export async function connectDB() {
  const customUri = process.env.MONGO_URI;

  if (customUri && customUri.trim() !== '') {
    try {
      console.log(`📡 Connecting to MongoDB at: ${customUri}...`);
      await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500
      });
      console.log('✅ Connected to MongoDB via Mongoose successfully.');
      await autoSeedIfEmpty();
      return;
    } catch (err) {
      console.warn(`⚠️ Could not connect to custom MongoDB (${err.message}).`);
      console.log('⚡ Switching to embedded resilient Document Store mode...');
    }
  } else {
    // Attempt local MongoDB if available
    try {
      console.log('📡 Checking for local MongoDB service (mongodb://127.0.0.1:27017/retail_inventory)...');
      await mongoose.connect('mongodb://127.0.0.1:27017/retail_inventory', {
        serverSelectionTimeoutMS: 1500,
        connectTimeoutMS: 1500
      });
      console.log('✅ Connected to local MongoDB via Mongoose.');
      await autoSeedIfEmpty();
      return;
    } catch (e) {
      console.log('ℹ️ No local MongoDB daemon active.');
    }
  }

  console.log('💡 Activated High-Performance Embedded Document Store (Zero-config MERN mode).');
  console.log('📂 Data is safely persisted in server/data/db_store.json');
  await autoSeedIfEmpty();
}

async function autoSeedIfEmpty() {
  const count = await Product.countDocuments();
  if (count === 0) {
    console.log('📦 Database is empty. Auto-seeding retail catalogue and 90-day sales history...');
    await seedDatabase();
  } else {
    console.log(`📊 Database loaded with ${count} retail products.`);
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}
