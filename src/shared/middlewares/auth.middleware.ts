import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../interfaces/common.interface';
import { verifyToken } from '../utils/jwt.util';
import ApiError from '../errors/ApiError';

/**
 * Authenticate user using JWT token
 */
export const authenticate = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided. Please login.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token as string);

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired. Please login again.'));
    } else {
      next(error);
    }
  }
};

/**
 * Authorize admin role
 */
export const authorizeAdmin = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Access denied. Admin privileges required.');
  }

  next();
};