import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 * @access  Private (User)
 */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'title price image stock isActive',
  });

  if (!cart) {
    // Return an empty cart structure if none exists yet
    return successResponse(res, { items: [] }, 'Cart retrieved successfully');
  }

  // Filter out products that have been deactivated or deleted
  cart.items = cart.items.filter(item => item.product && item.product.isActive);

  return successResponse(res, cart, 'Cart retrieved successfully');
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private (User)
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (quantity < 1) {
    return errorResponse(res, 'Quantity must be at least 1', 400);
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return errorResponse(res, 'Product not found', 404);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    // Create new cart
    if (quantity > product.stock) {
      return errorResponse(res, `Cannot add more than available stock (${product.stock})`, 400);
    }
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity }],
    });
  } else {
    // Update existing cart
    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      let newQuantity = cart.items[itemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return errorResponse(res, `Cannot add more than available stock (${product.stock})`, 400);
      }
      
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Product does not exist in cart, add it
      if (quantity > product.stock) {
        return errorResponse(res, `Cannot add more than available stock (${product.stock})`, 400);
      }
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
  }

  // Populate product details before returning
  cart = await cart.populate({
    path: 'items.product',
    select: 'title price image stock isActive',
  });

  return successResponse(res, cart, 'Item added to cart successfully');
});

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/:productId
 * @access  Private (User)
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    return errorResponse(res, 'Quantity must be at least 1. Use DELETE to remove item.', 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    return errorResponse(res, 'Product not found', 404);
  }

  if (quantity > product.stock) {
    return errorResponse(res, `Cannot update to more than available stock (${product.stock})`, 400);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return errorResponse(res, 'Cart not found', 404);
  }

  const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    const updatedCart = await cart.populate({
      path: 'items.product',
      select: 'title price image stock isActive',
    });
    return successResponse(res, updatedCart, 'Cart updated successfully');
  } else {
    return errorResponse(res, 'Item not found in cart', 404);
  }
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private (User)
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return errorResponse(res, 'Cart not found', 404);
  }

  cart.items = cart.items.filter(p => p.product.toString() !== productId);
  await cart.save();

  const updatedCart = await cart.populate({
    path: 'items.product',
    select: 'title price image stock isActive',
  });

  return successResponse(res, updatedCart, 'Item removed from cart');
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private (User)
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return successResponse(res, { items: [] }, 'Cart cleared');
});
