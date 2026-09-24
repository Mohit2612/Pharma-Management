import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import bcrypt from 'bcryptjs';
import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getPaginationInfo, buildPaginationMeta } from '../utils/pagination.js';

// ─── Dashboard Stats ──────────────────────────────────────────────────

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/dashboard/stats
 * @access  Private (Admin)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Aggregate total revenue and order counts
  const orderStats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        fulfilledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] },
        },
      },
    },
  ]);

  const stats = orderStats[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    fulfilledOrders: 0,
  };

  const totalProducts = await Product.countDocuments({ isActive: true });
  const lowStockProducts = await Product.countDocuments({ isActive: true, stock: { $lt: 5 } });
  const totalCustomers = await User.countDocuments({ isActive: true });

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'firstName lastName email');

  return successResponse(res, {
    revenue: stats.totalRevenue,
    orders: {
      total: stats.totalOrders,
      pending: stats.pendingOrders,
      fulfilled: stats.fulfilledOrders,
    },
    products: {
      total: totalProducts,
      lowStock: lowStockProducts,
    },
    customers: totalCustomers,
    recentOrders,
  }, 'Dashboard stats retrieved');
});

// ─── Customer Management ──────────────────────────────────────────────

/**
 * @desc    Get all customers
 * @route   GET /api/admin/customers
 * @access  Private (Admin)
 */
export const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, limit, skip } = getPaginationInfo(req.query.page, req.query.limit, 10);

  const query = {};
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const customers = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const meta = buildPaginationMeta(total, page, limit);

  return successResponse(res, { customers, meta }, 'Customers retrieved');
});

/**
 * @desc    Get customer by ID with order history
 * @route   GET /api/admin/customers/:id
 * @access  Private (Admin)
 */
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id);

  if (!customer) {
    return errorResponse(res, 'Customer not found', 404);
  }

  const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });

  return successResponse(res, { customer, orders }, 'Customer details retrieved');
});

/**
 * @desc    Update customer profile
 * @route   PUT /api/admin/customers/:id
 * @access  Private (Admin)
 */
export const updateCustomer = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, address, isActive } = req.body;
  const customer = await User.findById(req.params.id);

  if (!customer) {
    return errorResponse(res, 'Customer not found', 404);
  }

  customer.firstName = firstName || customer.firstName;
  customer.lastName = lastName || customer.lastName;
  customer.email = email || customer.email;
  customer.address = address || customer.address;
  
  if (isActive !== undefined) {
    customer.isActive = isActive === 'true' || isActive === true;
  }

  const updatedCustomer = await customer.save();
  return successResponse(res, updatedCustomer, 'Customer updated successfully');
});

// ─── Staff Management ─────────────────────────────────────────────────

/**
 * @desc    Get all staff (admins)
 * @route   GET /api/admin/staff
 * @access  Private (Admin)
 */
export const getStaff = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const staff = await Admin.find(query).sort({ createdAt: -1 });
  return successResponse(res, staff, 'Staff retrieved');
});

/**
 * @desc    Create new staff account
 * @route   POST /api/admin/staff
 * @access  Private (Admin)
 */
export const createStaff = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const exists = await Admin.findOne({ email });
  if (exists) {
    return errorResponse(res, 'Admin with this email already exists', 400);
  }

  const staff = await Admin.create({
    firstName,
    lastName,
    email,
    password, // Hashing handled by model pre-save hook
    role: role || 'manager',
  });

  return successResponse(res, {
    _id: staff._id,
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    role: staff.role,
  }, 'Staff account created', 201);
});

/**
 * @desc    Update staff account
 * @route   PUT /api/admin/staff/:id
 * @access  Private (Admin)
 */
export const updateStaff = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, role, isActive } = req.body;
  const staff = await Admin.findById(req.params.id);

  if (!staff) {
    return errorResponse(res, 'Staff member not found', 404);
  }

  staff.firstName = firstName || staff.firstName;
  staff.lastName = lastName || staff.lastName;
  staff.email = email || staff.email;
  staff.role = role || staff.role;
  
  if (isActive !== undefined) {
    staff.isActive = isActive === 'true' || isActive === true;
  }

  const updatedStaff = await staff.save();
  return successResponse(res, {
    _id: updatedStaff._id,
    firstName: updatedStaff.firstName,
    lastName: updatedStaff.lastName,
    email: updatedStaff.email,
    role: updatedStaff.role,
    isActive: updatedStaff.isActive,
  }, 'Staff updated successfully');
});
