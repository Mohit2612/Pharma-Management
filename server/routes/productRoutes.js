import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validators.js';
import { body } from 'express-validator';
import upload from '../middleware/upload.js';

const router = express.Router();

// Validation chains for products
const validateProduct = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('category')
    .isIn(['medicine', 'self-care', 'machine'])
    .withMessage('Category must be medicine, self-care, or machine'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
];

router
  .route('/')
  .get(getProducts)
  .post(
    protect,
    adminOnly,
    upload.single('image'),
    validateProduct,
    handleValidationErrors,
    createProduct
  );

router
  .route('/:id')
  .get(getProductById)
  .put(
    protect,
    adminOnly,
    upload.single('image'), // optional on update
    // Note: since fields might be partial on update or formData sends strings, 
    // validation rules can be relaxed or custom-handled.
    updateProduct
  )
  .delete(protect, adminOnly, deleteProduct);

export default router;
