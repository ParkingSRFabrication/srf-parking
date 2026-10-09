import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { ENV } from '../src/config/env.js';

describe('SR Fabrication Parking System - Full API Integration Tests', () => {
  let adminToken = '';
  let operatorToken = '';
  let testBikeTariffId = '';
  let createdTokenId = '';
  let createdTokenNumber = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Health Check responds with 200 and system details', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.system).toContain('SR FABRICATION');
  });

  it('Admin login with password succeeds and returns JWT tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'Admin@1234'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  it('Operator login with 4-digit MPIN succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'OP-001',
        mpin: '4321'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('operator');
    operatorToken = res.body.token;
  });

  it('Login lockout triggers after consecutive failed attempts', async () => {
    // Attempt invalid logins on a test operator
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({
          username: 'operator2',
          password: 'WrongPassword999'
        });
    }

    // 6th attempt should return 423 Locked
    const lockedRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'operator2',
        password: 'Operator@123'
      });

    expect(lockedRes.status).toBe(423);
    expect(lockedRes.body.message).toContain('locked');
  });

  it('Operator is forbidden from creating new tariffs (Admin only)', async () => {
    const res = await request(app)
      .post('/api/tariffs')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        category: 'bike',
        name: 'Unauthorized Tariff',
        billingMethod: '24_hour_daily',
        firstSlabAmount: 50
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Administrative privileges required');
  });

  it('Admin can fetch tariffs and preview calculations', async () => {
    const res = await request(app)
      .get('/api/tariffs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tariffs)).toBe(true);
    expect(res.body.tariffs.length).toBeGreaterThan(0);

    const bikeTariff = res.body.tariffs.find(t => t.category === 'bike');
    expect(bikeTariff).toBeDefined();
    testBikeTariffId = bikeTariff._id;

    // Test preview calculation endpoint
    const previewRes = await request(app)
      .post('/api/tariffs/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tariff: bikeTariff,
        entryTime: new Date(Date.now() - 25 * 3600000), // 25 hours ago
        exitTime: new Date()
      });

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.calculation.billableUnits).toBe(2);
    expect(previewRes.body.calculation.amountBilled).toBe(40);
  });

  it('Operator can issue an entry token for a new vehicle', async () => {
    const testRegNumber = `TS09TEST${Math.floor(1000 + Math.random() * 9000)}`;

    const res = await request(app)
      .post('/api/parking/entries')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        vehicleNumber: testRegNumber,
        vehicleType: 'bike',
        customerPhone: '9876500001',
        notes: 'Test entry token'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token.tokenNumber).toBeDefined();
    expect(res.body.token.status).toBe('INSIDE');

    createdTokenId = res.body.token._id;
    createdTokenNumber = res.body.token.tokenNumber;

    // Verify duplicate entry prevention: Attempting to enter same vehicle while INSIDE
    const duplicateRes = await request(app)
      .post('/api/parking/entries')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        vehicleNumber: testRegNumber,
        vehicleType: 'bike'
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.message).toContain('already has an active open session');
  });

  it('Operator can lookup token by tokenNumber and see live calculation', async () => {
    const res = await request(app)
      .get(`/api/parking/lookup?query=${createdTokenNumber}`)
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.token.tokenNumber).toBe(createdTokenNumber);
    expect(res.body.liveCharge).toBeDefined();
    expect(res.body.liveCharge.billableUnits).toBe(1);
  });

  it('Operator can process exit and record payment', async () => {
    const res = await request(app)
      .post(`/api/parking/tokens/${createdTokenId}/exit`)
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        paymentMethod: 'CASH',
        paymentReference: 'CASH-REC-01'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token.status).toBe('EXITED');
    expect(res.body.token.paymentStatus).toBe('PAID');
    expect(res.body.token.amountPaid).toBeGreaterThan(0);
    expect(res.body.receipt).toBeDefined();
  });

  it('Duplicate exit attempt is prevented', async () => {
    const res = await request(app)
      .post(`/api/parking/tokens/${createdTokenId}/exit`)
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        paymentMethod: 'CASH'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already exited');
  });

  it('Monthly pass issuance and duplicate active pass prevention', async () => {
    const passReg = `KA04PASS${Math.floor(1000 + Math.random() * 9000)}`;

    const passRes = await request(app)
      .post('/api/passes')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        vehicleNumber: passReg,
        vehicleType: 'bike',
        customerName: 'Kiran Patel',
        customerPhone: '9876543219',
        durationMonths: 1,
        startDate: new Date().toISOString(),
        amount: 300,
        paymentMethod: 'CASH'
      });

    expect(passRes.status).toBe(201);
    expect(passRes.body.pass.passNumber).toBeDefined();
    expect(passRes.body.pass.status).toBe('ACTIVE');

    // Duplicate pass for same vehicle while active should be rejected
    const dupPassRes = await request(app)
      .post('/api/passes')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        vehicleNumber: passReg,
        vehicleType: 'bike',
        customerName: 'Kiran Patel',
        durationMonths: 1,
        startDate: new Date().toISOString(),
        amount: 300
      });

    expect(dupPassRes.status).toBe(409);
    expect(dupPassRes.body.message).toContain('already exists');
  });

  it('Dashboard summary endpoint returns live dynamic metrics', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(typeof res.body.summary.vehiclesInside).toBe('number');
    expect(typeof res.body.summary.parkingRevenueToday).toBe('number');
    expect(Array.isArray(res.body.charts.vehicleTypeBreakdown)).toBe(true);
  });
});
