import { Request } from 'express';

// API Response interface
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T | null | undefined;
  error?: string | undefined;
  errors?: Array<{ path: string; message: string; }> | undefined;
}

// Pagination interface
export interface IPaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Request interface
export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// JWT Payload interface
export interface IJwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Socket User interface
export interface ISocketUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
}