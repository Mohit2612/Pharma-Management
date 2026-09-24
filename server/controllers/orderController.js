import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getPaginationInfo, buildPaginationMeta } from '../utils/pagination.js';

/**
 * @desc    Create new order from cart
 * @route   POST /api/orders
 * @access  Private (User)
 */
export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return errorResponse(res, 'Your cart is empty', 400);
  }

  const orderItems = [];
  let subtotal = 0;
  const processedItems = [];

  try {
    // Process each item: validate stock and decrement atomically
    for (const item of cart.items) {
      const product = item.product;
      const quantity = item.quantity;

      if (!product || !product.isActive) {
        throw new Error(`Product ${product?.title || 'Unknown'} is no longer available`);
      }

      // Atomic findOneAndUpdate to check stock and decrement simultaneously
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: quantity }, isActive: true },
        { $inc: { stock: -quantity } },
        { returnDocument: 'after' }
      );

      if (!updatedProduct) {
        throw new Error(`Not enough stock for ${product.title}`);
      }

      processedItems.push({ product: product._id, quantity });

      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price, // Snapshot price at time of purchase
        quantity,
      });

      subtotal += product.price * quantity;
    }
  } catch (error) {
    // Rollback stock decrement for already processed products
    for (const p of processedItems) {
      await Product.findByIdAndUpdate(p.product, { $inc: { stock: p.quantity } });
    }
    return errorResponse(res, error.message, 400);
  }

  // Calculate delivery fee logic
  let deliveryFee = 0;
  if (subtotal < 1000) {
    const itemCount = orderItems.reduce((acc, item) => acc + item.quantity, 0);
    deliveryFee = itemCount * 40;
  }

  const gst = subtotal * 0.05; // 5% GST
  const totalPrice = subtotal + deliveryFee + gst;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    subtotal,
    deliveryFee,
    gst,
    totalPrice,
    shippingAddress: req.body.shippingAddress || req.user.address || 'Address not provided',
    status: 'pending',
  });

  // Clear cart after successful order placement
  cart.items = [];
  await cart.save();

  return successResponse(res, order, 'Order placed successfully', 201);
});

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/my
 * @access  Private (User)
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return successResponse(res, orders, 'Orders retrieved');
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private (User must own it, or be Admin)
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

  if (!order) {
    return errorResponse(res, 'Order not found', 404);
  }

  // Ensure user owns this order (unless they are an admin)
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return errorResponse(res, 'Not authorized to view this order', 403);
  }

  return successResponse(res, order, 'Order retrieved');
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private (Admin)
 */
export const getOrders = asyncHandler(async (req, res) => {
  const { status, userId } = req.query;
  const { page, limit, skip } = getPaginationInfo(req.query.page, req.query.limit, 10);

  const query = {};
  if (status) query.status = status;
  if (userId) query.user = userId;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const meta = buildPaginationMeta(total, page, limit);

  return successResponse(res, { orders, meta }, 'Orders retrieved');
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin)
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return errorResponse(res, 'Order not found', 404);
  }

  order.status = status;
  const updatedOrder = await order.save();

  return successResponse(res, updatedOrder, 'Order status updated');
});
