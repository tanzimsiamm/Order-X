import { Response } from 'express';
import { IApiResponse } from '../interfaces/common.interface';

interface SuccessResponseOptions<T> {
  statusCode?: number;
  message: string;
  data?: T;
}

/**
 * Send success response
 */
export const sendSuccessResponse = <T>(
  res: Response,
  options: SuccessResponseOptions<T>
): Response => {
  const { statusCode = 200, message, data } = options;

  const response: IApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  error?: string
): Response => {
  const response: IApiResponse = {
    success: false,
    message,
    error,
  };

  return res.status(statusCode).json(response);
};