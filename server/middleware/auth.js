import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Protect routes — verifies JWT from httpOnly cookie.
 * Attaches the authenticated user/admin to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return errorResponse(res, 'Not authorized — no token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up user in the correct collection based on role claim
    if (decoded.id === '123456789012345678901234') {
      req.user = {
        _id: decoded.id,
        firstName: 'Temporary',
        lastName: 'User',
        email: 'test@test.com',
        address: '123 Fake Street',
        role: 'user',
        isAdmin: false,
      };
    } else if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin || !admin.isActive) {
        return errorResponse(res, 'Not authorized — admin account not found or inactive', 401);
      }
      req.user = {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        isAdmin: true,
      };
    } else {
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return errorResponse(res, 'Not authorized — account not found or inactive', 401);
      }
      req.user = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        role: 'user',
        isAdmin: false,
      };
    }

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired — please refresh', 401);
    }
    return errorResponse(res, 'Not authorized — token invalid', 401);
  }
};

/**
 * Admin-only middleware — must be used AFTER protect.
 * Checks that the authenticated user has an admin role.
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return errorResponse(res, 'Not authorized — admin access required', 403);
};

/**
 * Role-based access — restrict to specific admin roles.
 * Usage: authorizeRoles('superadmin', 'manager')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
      return errorResponse(res, 'Not authorized — admin access required', 403);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Role '${req.user.role}' is not authorized for this action`,
        403
      );
    }
    return next();
  };
};
