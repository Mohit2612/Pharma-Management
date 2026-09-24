import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';



let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

describe('Auth Endpoints Functional Tests', () => {
  const validUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password123!',
    address: '123 Test St',
  };

  const validAdmin = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    role: 'superadmin',
  };

  it('1. User signup with valid data -> 201, user created, password hashed', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(validUser.email);
    expect(res.headers['set-cookie']).toBeDefined(); // Cookies set

    // Verify DB
    const dbUser = await User.findOne({ email: validUser.email }).select('+password');
    expect(dbUser).toBeTruthy();
    expect(dbUser.password).not.toBe(validUser.password); // Not plaintext
    const isMatch = await bcrypt.compare(validUser.password, dbUser.password);
    expect(isMatch).toBe(true); // Is valid bcrypt hash
  });

  it('2. User signup with duplicate email -> 400 clean error', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/exists/i);
  });

  it('3. User signup with missing required fields -> 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' }); // Missing names and password
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/First name is required/i);
    expect(res.body.message).toMatch(/Last name is required/i);
    expect(res.body.message).toMatch(/Password is required/i);
  });

  it('4. User login with correct credentials -> 200, httpOnly cookie', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    
    // Check if cookies are set and httpOnly
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.includes('accessToken='))).toBe(true);
    expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true);
  });

  it('5. User login with wrong password -> 401 generic invalid credentials', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword1!' });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password'); // Generic message
  });

  it('6. Admin login with correct credentials -> 200, admin role token', async () => {
    const admin = new Admin(validAdmin);
    await admin.save();
    
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: validAdmin.email, password: validAdmin.password });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('superadmin');
    
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.includes('accessToken='))).toBe(true);
  });

  it('7. Access protected route with no token -> 401', async () => {
    const res = await request(app).get('/api/auth/me');
    
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Not authorized/i);
  });

  it('8. Access admin route with user token -> 403', async () => {
    // Register user and get cookies
    const loginRes = await request(app).post('/api/auth/register').send(validUser);
    const cookies = loginRes.headers['set-cookie'];
    
    // Try to access admin logout (which has adminOnly guard)
    const res = await request(app)
      .post('/api/auth/admin/logout')
      .set('Cookie', cookies);
    
    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/admin access required/i);
  });

  it('9. Access admin route with admin token -> 200', async () => {
    // Create admin directly in DB
    const admin = new Admin(validAdmin);
    await admin.save();
    
    // Login as admin to get cookies
    const loginRes = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: validAdmin.email, password: validAdmin.password });
    
    const cookies = loginRes.headers['set-cookie'];
    
    // Access admin logout
    const res = await request(app)
      .post('/api/auth/admin/logout')
      .set('Cookie', cookies);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});
