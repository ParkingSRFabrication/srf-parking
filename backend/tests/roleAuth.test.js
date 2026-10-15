import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { ENV } from '../src/config/env.js';

describe('Role-Based Authentication & Authorization (Admin, Operator, Customer)', () => {
  let adminToken = '';
  let operatorToken = '';
  let customerToken = '';
  let customerUsername = '';
  const testVehicleNumber = `KA05XY${Math.floor(1000 + Math.random() * 8999)}`;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGODB_URI);
    }

    // Login as existing Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'Admin@1234' });
    adminToken = adminRes.body.token;

    // Login as existing Operator
    const opRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'OP-001', mpin: '4321' });
    operatorToken = opRes.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('1. Public Registration Security', () => {
    it('Public registration MUST create Vehicle User / Customer role and reject privilege escalation', async () => {
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      customerUsername = `testuser_${uniqueSuffix}`;

      // Malicious attempt: Sending role: 'admin' during public registration
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Priya Verma',
          email: `priya_${uniqueSuffix}@example.com`,
          phone: `98765${uniqueSuffix}`,
          username: customerUsername,
          password: 'Password@123',
          role: 'admin', // Attack vector: trying to self-assign admin!
          vehicleNumber: testVehicleNumber,
          vehicleType: 'car'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      // MUST be customer, never admin!
      expect(res.body.user.role).toBe('customer');
      expect(res.body.user.operatorId).toMatch(/^CUST-/);
      expect(res.body.user.vehicles).toHaveLength(1);
      expect(res.body.user.vehicles[0].registrationNumber).toBe(testVehicleNumber);

      customerToken = res.body.token;
    });

    it('Customer can log in using email, phone, or username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: customerUsername,
          password: 'Password@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('customer');
    });
  });

  describe('2. Backend Route Authorization Enforcements', () => {
    it('Customer is FORBIDDEN from accessing Admin operator management', async () => {
      const res = await request(app)
        .get('/api/operators')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Administrative privileges required');
    });

    it('Customer is FORBIDDEN from modifying parking tariffs', async () => {
      const res = await request(app)
        .post('/api/tariffs')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          category: 'bike',
          name: 'Hacked Price',
          firstSlabAmount: 0
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Administrative privileges required');
    });

    it('Customer is FORBIDDEN from modifying system settings', async () => {
      const res = await request(app)
        .patch('/api/settings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ businessName: 'Compromised Name' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Administrative privileges required');
    });

    it('Customer is FORBIDDEN from creating booth tokens or accessing operator tokens list', async () => {
      const res = await request(app)
        .get('/api/parking/tokens')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });

    it('Operator CANNOT change tariffs or prices', async () => {
      const res = await request(app)
        .post('/api/tariffs')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          category: 'car',
          name: 'Unauthorized Operator Tariff',
          firstSlabAmount: 10
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Administrative privileges required');
    });

    it('Operator CANNOT access or create operator / admin accounts', async () => {
      const res = await request(app)
        .post('/api/operators')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          username: 'hackop',
          operatorId: 'HCK-01',
          name: 'Hacker',
          password: 'Pass@123'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Administrative privileges required');
    });

    it('Operator CAN access daily parking operations (tokens, passes, lookup)', async () => {
      const res = await request(app)
        .get('/api/parking/tokens')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('3. Customer Dashboard & Vehicle Management APIs', () => {
    it('Customer can access their own dashboard', async () => {
      const res = await request(app)
        .get('/api/customer/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.username).toBe(customerUsername);
      expect(res.body.vehicles).toHaveLength(1);
      expect(res.body.stats).toBeDefined();
    });

    it('Customer can add and manage registered vehicles', async () => {
      const newBike = `KA01AB${Math.floor(1000 + Math.random() * 8999)}`;
      const res = await request(app)
        .post('/api/customer/vehicles')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          registrationNumber: newBike,
          vehicleType: 'bike',
          nickname: 'Second Bike'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicle.registrationNumber).toBe(newBike);

      // Remove the vehicle
      const delRes = await request(app)
        .delete(`/api/customer/vehicles/${newBike}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
      expect(delRes.body.vehicles.some(v => v.registrationNumber === newBike)).toBe(false);
    });
  });
});
