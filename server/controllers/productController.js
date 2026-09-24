import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getPaginationInfo, buildPaginationMeta } from '../utils/pagination.js';
import fs from 'fs';
import path from 'path';

/**
 * @desc    Get all products (with text search, category filter, sorting, pagination)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort } = req.query;
  const { page, limit, skip } = getPaginationInfo(req.query.page, req.query.limit, 12);

  // Build query
  const query = { isActive: true };

  // Category filter
  if (category) {
    query.category = category;
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Build sort
  let sortOption = { createdAt: -1 }; // newest by default
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (search && !sort) sortOption = { score: { $meta: 'textScore' } }; // Sort by relevance if searching

  // Execute query
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const meta = buildPaginationMeta(total, page, limit);

  return successResponse(res, { products, meta }, 'Products retrieved successfully');
});

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    return errorResponse(res, 'Product not found', 404);
  }

  return successResponse(res, product, 'Product retrieved successfully');
});

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const { title, brand, category, description, tags, stock, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const product = await Product.create({
    title,
    brand,
    category,
    description,
    tags: tags || '',
    stock,
    price,
    image,
  });

  return successResponse(res, product, 'Product created successfully', 201);
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { title, brand, category, description, tags, stock, price, isActive } = req.body;
  
  const product = await Product.findById(req.params.id);
  if (!product) {
    return errorResponse(res, 'Product not found', 404);
  }

  product.title = title || product.title;
  product.brand = brand || product.brand;
  product.category = category || product.category;
  product.description = description || product.description;
  product.tags = tags !== undefined ? tags : product.tags;
  product.stock = stock !== undefined ? stock : product.stock;
  product.price = price !== undefined ? price : product.price;
  
  if (isActive !== undefined) {
    product.isActive = isActive === 'true' || isActive === true;
  }

  // Handle image replacement
  if (req.file) {
    // Optionally delete old image from disk here
    if (product.image && product.image.startsWith('/uploads/')) {
      const oldPath = path.join(process.cwd(), 'public', product.image);
      fs.unlink(oldPath, (err) => {
        if (err) console.error('Failed to delete old image:', err);
      });
    }
    product.image = `/uploads/${req.file.filename}`;
  }

  const updatedProduct = await product.save();
  return successResponse(res, updatedProduct, 'Product updated successfully');
});

/**
 * @desc    Delete a product (soft delete by setting isActive = false)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return errorResponse(res, 'Product not found', 404);
  }

  product.isActive = false;
  await product.save();

  return successResponse(res, null, 'Product deactivated successfully');
});
