import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

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
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Phase 2 Business Routes Tests', () => {
  let userCookies;
  let adminCookies;
  let user;
  let admin;

  beforeEach(async () => {
    // Register User
    const userRes = await request(app).post('/api/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      address: '123 Main St',
    });
    userCookies = userRes.headers['set-cookie'];
    user = await User.findOne({ email: 'john@example.com' });

    // Create & Login Admin
    admin = await Admin.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'superadmin',
    });
    const adminRes = await request(app).post('/api/auth/admin/login').send({
      email: 'admin@example.com',
      password: 'Password123!',
    });
    adminCookies = adminRes.headers['set-cookie'];
  });

  describe('Product Routes', () => {
    it('should create a product (Admin)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookies)
        .send({
          title: 'Paracetamol',
          brand: 'PharmaInc',
          category: 'medicine',
          description: 'Pain reliever',
          stock: 100,
          price: 5.99,
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.title).toBe('Paracetamol');
    });

    it('should fail to create product (Non-Admin)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', userCookies)
        .send({
          title: 'Hacked',
          brand: 'Hacker',
          category: 'medicine',
          description: 'bad',
          stock: 10,
          price: 10,
        });
      
      expect(res.statusCode).toEqual(403); // adminOnly
    });
  });

  describe('Cart Routes', () => {
    let product;
    beforeEach(async () => {
      product = await Product.create({
        title: 'Band-Aid',
        brand: 'J&J',
        category: 'self-care',
        description: 'Plasters',
        stock: 5,
        price: 2.99,
      });
    });

    it('should add item to cart (User)', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Cookie', userCookies)
        .send({
          productId: product._id,
          quantity: 2,
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items[0].quantity).toBe(2);
    });

    it('should fail to add more quantity than available stock', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Cookie', userCookies)
        .send({
          productId: product._id,
          quantity: 10, // Exceeds 5
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/more than available stock/i);
    });
  });

  describe('Order Routes (Stock decrement)', () => {
    let product;
    beforeEach(async () => {
      product = await Product.create({
        title: 'Thermometer',
        brand: 'HealthCo',
        category: 'machine',
        description: 'Digital thermometer',
        stock: 10,
        price: 15.00,
      });
      // Add to cart
      await request(app)
        .post('/api/cart')
        .set('Cookie', userCookies)
        .send({ productId: product._id, quantity: 3 });
    });

    it('should place order and atomically decrement stock', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Cookie', userCookies);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.items[0].quantity).toBe(3);

      // Verify stock was decremented
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(7); // 10 - 3 = 7

      // Verify cart was cleared
      const cart = await Cart.findOne({ user: user._id });
      expect(cart.items.length).toBe(0);
    });

    it('should fail to place order if cart is empty', async () => {
      // Clear cart first
      await request(app).delete('/api/cart').set('Cookie', userCookies);

      const res = await request(app)
        .post('/api/orders')
        .set('Cookie', userCookies);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/cart is empty/i);
    });
  });

  describe('Admin Dashboard Stats', () => {
    it('should correctly aggregate revenue and order counts', async () => {
      // Create some products
      const p1 = await Product.create({ title: 'A', brand: 'A', category: 'medicine', description: 'A', stock: 50, price: 10 });
      const p2 = await Product.create({ title: 'B', brand: 'B', category: 'medicine', description: 'B', stock: 2, price: 20 }); // Low stock

      // Create some orders directly in DB
      await Order.create({
        user: user._id,
        items: [{ product: p1._id, title: 'A', price: 10, quantity: 2 }], // Subtotal: 20
        subtotal: 20,
        deliveryFee: 40,
        totalPrice: 60,
        shippingAddress: '123 test',
        status: 'pending'
      });
      await Order.create({
        user: user._id,
        items: [{ product: p2._id, title: 'B', price: 20, quantity: 1 }], // Subtotal: 20
        subtotal: 20,
        deliveryFee: 40,
        totalPrice: 60,
        shippingAddress: '123 test',
        status: 'fulfilled'
      });

      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toEqual(200);
      const stats = res.body.data;
      
      expect(stats.revenue).toBe(120); // 60 + 60
      expect(stats.orders.total).toBe(2);
      expect(stats.orders.pending).toBe(1);
      expect(stats.orders.fulfilled).toBe(1);
      expect(stats.products.total).toBe(2);
      expect(stats.products.lowStock).toBe(1); // p2 stock is 2 (< 5)
    });
  });
});
