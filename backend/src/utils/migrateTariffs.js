import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { ENV } from '../config/env.js';
import { Tariff, BusinessSettings } from '../models/index.js';

async function run() {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Update Bike (₹20 daily, ₹200 monthly)
    await Tariff.updateOne(
      { category: 'bike' },
      { $set: { firstSlabAmount: 20, additionalDayAmount: 20, monthlyAmount: 200, isActive: true } }
    );

    // 2. Update Car (₹40 daily, ₹400 monthly)
    await Tariff.updateOne(
      { category: 'car' },
      { $set: { firstSlabAmount: 40, additionalDayAmount: 40, monthlyAmount: 400, isActive: true } }
    );

    // 3. Update Bus (₹70 daily, ₹700 monthly)
    await Tariff.updateOne(
      { category: 'bus' },
      { $set: { firstSlabAmount: 70, additionalDayAmount: 70, monthlyAmount: 700, isActive: true } }
    );

    // 4. Update Truck / Big Vehicles (₹70 daily, ₹800 monthly)
    await Tariff.updateOne(
      { category: 'truck' },
      { $set: { name: 'Big Vehicles / Heavy Truck 24h Daily', firstSlabAmount: 70, additionalDayAmount: 70, monthlyAmount: 800, isActive: true } }
    );

    // 5. Ensure Lorry exists (₹70 daily, ₹700 monthly)
    const lorry = await Tariff.findOne({ category: 'lorry' });
    if (!lorry) {
      await Tariff.create({
        category: 'lorry',
        name: 'Lorry / Goods Carrier 24h Daily',
        billingMethod: '24_hour_daily',
        firstSlabAmount: 70,
        additionalDayAmount: 70,
        monthlyAmount: 700,
        hourlyAmount: 0,
        freeGraceMinutes: 0,
        isActive: true
      });
    } else {
      await Tariff.updateOne(
        { category: 'lorry' },
        { $set: { firstSlabAmount: 70, additionalDayAmount: 70, monthlyAmount: 700, isActive: true } }
      );
    }

    // 6. Ensure JCB exists (₹70 daily, ₹700 monthly)
    const jcb = await Tariff.findOne({ category: 'jcb' });
    if (!jcb) {
      await Tariff.create({
        category: 'jcb',
        name: 'JCB / Heavy Earthmover 24h Daily',
        billingMethod: '24_hour_daily',
        firstSlabAmount: 70,
        additionalDayAmount: 70,
        monthlyAmount: 700,
        hourlyAmount: 0,
        freeGraceMinutes: 0,
        isActive: true
      });
    } else {
      await Tariff.updateOne(
        { category: 'jcb' },
        { $set: { firstSlabAmount: 70, additionalDayAmount: 70, monthlyAmount: 700, isActive: true } }
      );
    }

    // 7. Auto & Cycle & others
    await Tariff.updateOne({ category: 'auto' }, { $set: { monthlyAmount: 300 } });
    await Tariff.updateOne({ category: 'cycle' }, { $set: { monthlyAmount: 100 } });
    await Tariff.updateOne({ category: 'tempo' }, { $set: { firstSlabAmount: 70, additionalDayAmount: 60, monthlyAmount: 500 } });
    await Tariff.updateOne({ category: 'other' }, { $set: { firstSlabAmount: 50, additionalDayAmount: 50, monthlyAmount: 500 } });

    // 8. Update BusinessSettings categories list
    const settings = await BusinessSettings.findOne();
    if (settings) {
      const existingIds = new Set((settings.categories || []).map(c => c.id));
      const newCategories = [...(settings.categories || [])];
      if (!existingIds.has('lorry')) {
        newCategories.push({ id: 'lorry', name: 'Lorry / Goods Carrier', enabled: true, isVehicle: true });
      }
      if (!existingIds.has('jcb')) {
        newCategories.push({ id: 'jcb', name: 'JCB / Earthmover', enabled: true, isVehicle: true });
      }
      settings.categories = newCategories;
      await settings.save();
    }

    const tariffs = await Tariff.find({}).sort({ firstSlabAmount: 1 });
    console.log('\n=== TARIFFS IN DATABASE AFTER MIGRATION ===');
    tariffs.forEach(t => {
      console.log(`${t.category.padEnd(10)} | ${t.name.padEnd(35)} | Daily: ₹${t.firstSlabAmount} | Addl: ₹${t.additionalDayAmount} | Monthly: ₹${t.monthlyAmount}`);
    });

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
