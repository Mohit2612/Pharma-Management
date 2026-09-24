import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validators.js';

const router = express.Router();

router
  .route('/')
  .post(protect, createOrder) // Validation happens intrinsically by checking cart contents
  .get(protect, adminOnly, getOrders);

router.route('/my').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router
  .route('/:id/status')
  .put(
    protect,
    adminOnly,
    body('status').isIn(['pending', 'fulfilled', 'cancelled']).withMessage('Invalid status'),
    handleValidationErrors,
    updateOrderStatus
  );

export default router;
