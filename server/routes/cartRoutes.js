import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validators.js';

const router = express.Router();

const validateCartAction = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

router
  .route('/')
  .get(protect, getCart)
  .post(protect, validateCartAction, handleValidationErrors, addToCart)
  .delete(protect, clearCart);

router
  .route('/:productId')
  .put(
    protect,
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    handleValidationErrors,
    updateCartItem
  )
  .delete(protect, removeCartItem);

export default router;
