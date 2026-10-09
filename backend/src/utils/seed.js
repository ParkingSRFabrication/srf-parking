import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { ENV } from '../config/env.js';
import {
  User,
  ParkingLocation,
  Device,
  Tariff,
  Vehicle,
  ParkingToken,
  MonthlyPass,
  Payment,
  BusinessSettings,
  AuditLog
} from '../models/index.js';
import { generateTokenNumber, generatePassNumber, generatePaymentId } from './tokenGenerator.js';

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${ENV.MONGODB_URI}...`);
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('Connected to MongoDB. Beginning development seeding...');

    // Clear existing development collections
    await Promise.all([
      User.deleteMany({}),
      ParkingLocation.deleteMany({}),
      Device.deleteMany({}),
      Tariff.deleteMany({}),
      Vehicle.deleteMany({}),
      ParkingToken.deleteMany({}),
      MonthlyPass.deleteMany({}),
      Payment.deleteMany({}),
      BusinessSettings.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('Cleared existing development records.');

    // 1. Business Settings
    const settings = await BusinessSettings.create({
      businessName: 'SR FABRICATION',
      tagline: 'Railway Station Vehicle Parking Management System',
      locationName: 'Railway Station Parking Plaza - Main Entry',
      stationCode: 'SRF-MAIN',
      tokenPrefix: 'SRF',
      passPrefix: 'SRF-PASS',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      currencySymbol: '₹',
      receiptHeader: 'SR FABRICATION\nRAILWAY STATION VEHICLE PARKING PLAZA',
      receiptFooter: 'Authorized Railway Parking Contractor: SR Fabrication.\nKeep token safely. Lost token fee ₹100.',
      passExpiringSoonDays: 5,
      contactPhone: '+91 98765 43210',
      contactAddress: 'Station Road, Platform 1 East Gate, Railway Station',
      categories: [
        { id: 'bike', name: 'Two Wheeler (Bike / Scooter)', enabled: true, isVehicle: true },
        { id: 'car', name: 'Four Wheeler (Car / SUV)', enabled: true, isVehicle: true },
        { id: 'auto', name: 'Auto Rickshaw', enabled: true, isVehicle: true },
        { id: 'cycle', name: 'Bicycle', enabled: true, isVehicle: true },
        { id: 'bus', name: 'Bus / Van', enabled: true, isVehicle: true },
        { id: 'truck', name: 'Truck', enabled: true, isVehicle: true },
        { id: 'tempo', name: 'Tempo / Carrier', enabled: true, isVehicle: true },
        { id: 'other', name: 'Other Vehicles', enabled: true, isVehicle: true },
        { id: 'helmet', name: 'Helmet Deposit', enabled: true, isVehicle: false },
        { id: 'locker', name: 'Luggage / Locker', enabled: true, isVehicle: false }
      ]
    });

    // 2. Parking Location
    const location = await ParkingLocation.create({
      name: 'SR Fabrication - Railway Station Main Plaza',
      code: 'SRF-MAIN',
      stationName: 'Central Railway Junction',
      address: 'East Circulating Area, Railway Station',
      contactPhone: '+91 98765 43210',
      capacity: {
        bike: 300,
        car: 80,
        auto: 40,
        cycle: 150,
        bus: 15,
        truck: 10,
        tempo: 25,
        other: 50,
        helmet: 120,
        locker: 60
      }
    });

    // 3. User Accounts (Hashed credentials)
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@1234', salt);
    const adminMpinHash = await bcrypt.hash('1234', salt);
    const opPasswordHash = await bcrypt.hash('Operator@123', salt);
    const opMpinHash = await bcrypt.hash('4321', salt);

    const adminUser = await User.create({
      username: 'admin',
      operatorId: 'ADM-001',
      name: 'Suresh Rao (System Administrator)',
      role: 'admin',
      passwordHash: adminPasswordHash,
      mpinHash: adminMpinHash,
      assignedLocation: location._id,
      permissions: ['all'],
      isActive: true
    });

    const operatorUser = await User.create({
      username: 'operator1',
      operatorId: 'OP-001',
      name: 'Ramesh Kumar (Booth Operator 1)',
      role: 'operator',
      passwordHash: opPasswordHash,
      mpinHash: opMpinHash,
      assignedLocation: location._id,
      permissions: ['create_token', 'exit_token', 'manage_passes', 'view_reports'],
      isActive: true
    });

    const operator2 = await User.create({
      username: 'operator2',
      operatorId: 'OP-002',
      name: 'Vikram Singh (Booth Operator 2)',
      role: 'operator',
      passwordHash: opPasswordHash,
      mpinHash: await bcrypt.hash('5678', salt),
      assignedLocation: location._id,
      permissions: ['create_token', 'exit_token', 'manage_passes'],
      isActive: true
    });

    // 4. Default Tariffs
    const tariffsData = [
      { category: 'bike', name: 'Two Wheeler 24h Daily', billingMethod: '24_hour_daily', firstSlabAmount: 20, additionalDayAmount: 20 },
      { category: 'car', name: 'Four Wheeler 24h Daily', billingMethod: '24_hour_daily', firstSlabAmount: 50, additionalDayAmount: 40 },
      { category: 'auto', name: 'Auto Rickshaw Daily', billingMethod: '24_hour_daily', firstSlabAmount: 30, additionalDayAmount: 30 },
      { category: 'cycle', name: 'Bicycle Daily', billingMethod: '24_hour_daily', firstSlabAmount: 10, additionalDayAmount: 10 },
      { category: 'bus', name: 'Bus 24h Daily', billingMethod: '24_hour_daily', firstSlabAmount: 100, additionalDayAmount: 100 },
      { category: 'truck', name: 'Truck 24h Daily', billingMethod: '24_hour_daily', firstSlabAmount: 120, additionalDayAmount: 120 },
      { category: 'tempo', name: 'Tempo 24h Daily', billingMethod: '24_hour_daily', firstSlabAmount: 70, additionalDayAmount: 60 },
      { category: 'other', name: 'Other Vehicles Daily', billingMethod: '24_hour_daily', firstSlabAmount: 50, additionalDayAmount: 50 },
      { category: 'helmet', name: 'Helmet Fixed Charge', billingMethod: 'fixed', firstSlabAmount: 15, additionalDayAmount: 0 },
      { category: 'locker', name: 'Locker Hourly Charge', billingMethod: 'hourly', firstSlabAmount: 20, hourlyAmount: 10 }
    ];

    const tariffs = await Tariff.insertMany(
      tariffsData.map(t => ({
        ...t,
        freeGraceMinutes: 0,
        effectiveFrom: new Date(),
        isActive: true,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      }))
    );

    const bikeTariff = tariffs.find(t => t.category === 'bike');
    const carTariff = tariffs.find(t => t.category === 'car');

    // 5. Vehicles
    const vehiclesData = [
      { registrationNumber: 'MH12AB1234', type: 'bike', ownerName: 'Amit Sharma', ownerPhone: '9876543211', totalVisits: 5, totalAmountSpent: 120 },
      { registrationNumber: 'DL01CA9999', type: 'car', ownerName: 'Pooja Verma', ownerPhone: '9876543212', totalVisits: 3, totalAmountSpent: 150 },
      { registrationNumber: 'KA03MG4567', type: 'car', ownerName: 'Rajesh Iyer', ownerPhone: '9876543213', totalVisits: 8, totalAmountSpent: 650 },
      { registrationNumber: 'UP32AZ8888', type: 'auto', ownerName: 'Mohd. Salim', ownerPhone: '9876543214', totalVisits: 12, totalAmountSpent: 360 },
      { registrationNumber: 'MH14XY5555', type: 'cycle', ownerName: 'Ganesh Shinde', ownerPhone: '9876543215', totalVisits: 20, totalAmountSpent: 200 }
    ];

    await Vehicle.insertMany(vehiclesData);

    // 6. Monthly Passes (1 active, 1 expiring soon, 1 expired)
    const now = new Date();
    const activePassStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const activePassExpiry = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const expiringSoonPassStart = new Date(now.getTime() - 27 * 86400000);
    const expiringSoonPassExpiry = new Date(now.getTime() + 3 * 86400000); // Expires in 3 days

    const expiredPassStart = new Date(now.getTime() - 60 * 86400000);
    const expiredPassExpiry = new Date(now.getTime() - 30 * 86400000);

    const samplePass1 = await MonthlyPass.create({
      passNumber: 'SRF-PASS-2026-0001',
      vehicleNumber: 'KA03MG4567',
      vehicleType: 'car',
      customerName: 'Rajesh Iyer',
      customerPhone: '9876543213',
      durationMonths: 1,
      startDate: activePassStart,
      expiryDate: activePassExpiry,
      amount: 600,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      paymentReference: 'UPI/2026/88992211',
      status: 'ACTIVE',
      location: location._id,
      issuedBy: operatorUser._id
    });

    const samplePass2 = await MonthlyPass.create({
      passNumber: 'SRF-PASS-2026-0002',
      vehicleNumber: 'MH12AB1234',
      vehicleType: 'bike',
      customerName: 'Amit Sharma',
      customerPhone: '9876543211',
      durationMonths: 1,
      startDate: expiringSoonPassStart,
      expiryDate: expiringSoonPassExpiry,
      amount: 300,
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      status: 'ACTIVE',
      location: location._id,
      issuedBy: operatorUser._id
    });

    const samplePass3 = await MonthlyPass.create({
      passNumber: 'SRF-PASS-2026-0003',
      vehicleNumber: 'MH14XY5555',
      vehicleType: 'cycle',
      customerName: 'Ganesh Shinde',
      customerPhone: '9876543215',
      durationMonths: 1,
      startDate: expiredPassStart,
      expiryDate: expiredPassExpiry,
      amount: 150,
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      status: 'EXPIRED',
      location: location._id,
      issuedBy: operatorUser._id
    });

    // Payments for passes
    await Payment.create([
      {
        paymentId: 'PAY-PASS-0001',
        type: 'MONTHLY_PASS',
        monthlyPass: samplePass1._id,
        amount: 600,
        currency: 'INR',
        method: 'UPI',
        status: 'COMPLETED',
        transactionReference: 'UPI/2026/88992211',
        operator: operatorUser._id,
        location: location._id,
        createdAt: activePassStart
      },
      {
        paymentId: 'PAY-PASS-0002',
        type: 'MONTHLY_PASS',
        monthlyPass: samplePass2._id,
        amount: 300,
        currency: 'INR',
        method: 'CASH',
        status: 'COMPLETED',
        operator: operatorUser._id,
        location: location._id,
        createdAt: expiringSoonPassStart
      }
    ]);

    // 7. Parking Tokens (Currently Inside + Recently Exited)
    const token1 = await ParkingToken.create({
      tokenNumber: 'SRF-20261009-0001',
      vehicleNumber: 'DL01CA9999',
      vehicleType: 'car',
      customerPhone: '9876543212',
      location: location._id,
      entryOperator: operatorUser._id,
      status: 'INSIDE',
      entryTime: new Date(now.getTime() - (2 * 3600000 + 30 * 60000)), // 2h 30m ago
      tariffSnapshot: {
        category: carTariff.category,
        billingMethod: carTariff.billingMethod,
        firstSlabAmount: carTariff.firstSlabAmount,
        additionalDayAmount: carTariff.additionalDayAmount,
        hourlyAmount: carTariff.hourlyAmount,
        freeGraceMinutes: 0,
        tariffId: carTariff._id
      }
    });

    const token2 = await ParkingToken.create({
      tokenNumber: 'SRF-20261009-0002',
      vehicleNumber: 'MH12AB1234',
      vehicleType: 'bike',
      location: location._id,
      entryOperator: operatorUser._id,
      status: 'INSIDE',
      entryTime: new Date(now.getTime() - (1 * 3600000)), // 1h ago
      coveredByPass: samplePass2._id,
      tariffSnapshot: {
        category: bikeTariff.category,
        billingMethod: bikeTariff.billingMethod,
        firstSlabAmount: bikeTariff.firstSlabAmount,
        additionalDayAmount: bikeTariff.additionalDayAmount,
        hourlyAmount: bikeTariff.hourlyAmount,
        freeGraceMinutes: 0,
        tariffId: bikeTariff._id
      }
    });

    // Exited token today with recorded payment
    const exitTime = new Date(now.getTime() - 15 * 60000);
    const entryTimeExited = new Date(now.getTime() - (5 * 3600000));
    const token3 = await ParkingToken.create({
      tokenNumber: 'SRF-20261009-0003',
      vehicleNumber: 'UP32AZ8888',
      vehicleType: 'auto',
      location: location._id,
      entryOperator: operatorUser._id,
      exitOperator: operator2._id,
      status: 'EXITED',
      entryTime: entryTimeExited,
      exitTime: exitTime,
      durationMinutes: 300,
      billableUnits: 1,
      amountBilled: 30,
      amountPaid: 30,
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      tariffSnapshot: {
        category: 'auto',
        billingMethod: '24_hour_daily',
        firstSlabAmount: 30,
        additionalDayAmount: 30,
        freeGraceMinutes: 0
      }
    });

    await Payment.create({
      paymentId: 'PAY-TOKEN-0001',
      type: 'PARKING_TOKEN',
      parkingToken: token3._id,
      amount: 30,
      currency: 'INR',
      method: 'CASH',
      status: 'COMPLETED',
      operator: operator2._id,
      location: location._id,
      createdAt: exitTime
    });

    // 8. Initial Audit Log
    await AuditLog.create({
      actor: adminUser._id,
      actorName: adminUser.name,
      actorRole: adminUser.role,
      action: 'SYSTEM_SEEDED',
      entityType: 'Database',
      entityId: 'ALL',
      details: { environment: 'development', timestamp: new Date().toISOString() }
    });

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Sample Accounts for Development:');
    console.log('1. Administrator:');
    console.log('   Username: admin  OR  Operator ID: ADM-001');
    console.log('   Password: Admin@1234');
    console.log('   MPIN:     1234');
    console.log('2. Parking Operator:');
    console.log('   Username: operator1  OR  Operator ID: OP-001');
    console.log('   Password: Operator@123');
    console.log('   MPIN:     4321');
    console.log('3. Parking Operator 2:');
    console.log('   Username: operator2  OR  Operator ID: OP-002');
    console.log('   Password: Operator@123');
    console.log('   MPIN:     5678');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
