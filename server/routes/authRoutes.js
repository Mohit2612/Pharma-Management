import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getMe,
  loginAdmin,
  logoutAdmin,
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../middleware/validators.js';

const router = express.Router();

// ─── User Routes ──────────────────────────────────────────────────────
router.post('/register', validateRegister, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getMe);

// ─── Admin Routes ─────────────────────────────────────────────────────
router.post('/admin/login', validateLogin, handleValidationErrors, loginAdmin);
router.post('/admin/logout', protect, adminOnly, logoutAdmin);

export default router;
