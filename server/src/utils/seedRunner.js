import dotenv from 'dotenv';
import { connectDB } from '../db.js';
import { seedDatabase } from './dataSeeder.js';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
  try {
    await connectDB();
    await seedDatabase();
    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

run();
