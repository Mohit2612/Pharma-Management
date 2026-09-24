import express from 'express';
import {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  updateCustomer,
  getStaff,
  createStaff,
  updateStaff,
} from '../controllers/adminController.js';
import { protect, adminOnly, authorizeRoles } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validators.js';

const router = express.Router();

// All routes here require admin access
router.use(protect, adminOnly);

// ─── Dashboard Stats ──────────────────────────────────────────────────
router.get('/dashboard/stats', getDashboardStats);

// ─── Customers ────────────────────────────────────────────────────────
router.route('/customers').get(getCustomers);

router
  .route('/customers/:id')
  .get(getCustomerById)
  .put(
    body('email').optional().isEmail().withMessage('Valid email required'),
    handleValidationErrors,
    updateCustomer
  );

// ─── Staff ────────────────────────────────────────────────────────────
// Optional: restrict staff creation to superadmins
// router.use('/staff', authorizeRoles('superadmin')); 

router
  .route('/staff')
  .get(getStaff)
  .post(
    body('firstName').notEmpty().withMessage('First name required'),
    body('lastName').notEmpty().withMessage('Last name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
    body('role').optional().isIn(['superadmin', 'manager', 'support', 'inventory']),
    handleValidationErrors,
    createStaff
  );

router
  .route('/staff/:id')
  .put(
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['superadmin', 'manager', 'support', 'inventory']),
    handleValidationErrors,
    updateStaff
  );

export default router;
