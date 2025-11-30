import { z } from 'zod';

// Update order status schema
export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    orderStatus: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'], {
      errorMap: () => ({
        message: 'Order status must be PENDING, PROCESSING, SHIPPED, or DELIVERED',
      }),
    }),
  }),
});

// Get all orders schema
export const getAllOrdersSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED']).optional(),
  }),
});

// Type inference
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type GetAllOrdersQuery = z.infer<typeof getAllOrdersSchema>['query'];