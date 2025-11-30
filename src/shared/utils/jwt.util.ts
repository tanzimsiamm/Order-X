import jwt from 'jsonwebtoken';
import config from '../config/env';
import { IJwtPayload } from '../interfaces/common.interface';

/**
 * Generate JWT token
 */
export const generateToken = (
  payload: Omit<IJwtPayload, 'iat' | 'exp'>
): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): IJwtPayload => {
  return jwt.verify(token, config.jwt.secret) as IJwtPayload;
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token: string): IJwtPayload | null => {
  return jwt.decode(token) as IJwtPayload | null;
};