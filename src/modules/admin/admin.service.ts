import { PrismaClient } from '@prisma/client';
import { emitToUser } from '../../shared/socket/socket';
import ApiError from '../../shared/errors/ApiError';
import logger from '../../shared/utils/logger.util';
import { IAdminOrdersResponse, IOrderStats } from './admin.interface';
import { IOrderWithUser, OrderStatus } from '../order/order.interface';

const prisma = new PrismaClient();

class AdminService {
  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<IOrderWithUser> {
    // Get order with user details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Order ${orderId} status updated to ${newStatus} by admin`);

    // Status messages
    const statusMessages: Record<OrderStatus, string> = {
      PENDING: '⏳ Your order is pending.',
      PROCESSING: '🔄 Your order is being processed.',
      SHIPPED: '🚚 Your order has been shipped!',
      DELIVERED: '✅ Your order has been delivered!',
    };

    // Send real-time notification to user
    emitToUser(order.userId, 'orderUpdate', {
      orderId: updatedOrder.id,
      orderStatus: updatedOrder.orderStatus,
      paymentStatus: updatedOrder.paymentStatus,
      message: statusMessages[newStatus],
      timestamp: new Date(),
    });

    logger.info(`Real-time notification sent to user ${order.userId}`);

    return updatedOrder as IOrderWithUser;
  }

  /**
   * Get all orders with pagination and filters
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status?: OrderStatus,
    paymentStatus?: string
  ): Promise<IAdminOrdersResponse> {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.orderStatus = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    // Get orders and total count
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders as IOrderWithUser[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order by ID (admin access - any user's order)
   */
  async getOrderById(orderId: string): Promise<IOrderWithUser> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order as IOrderWithUser;
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<IOrderStats> {
    const [total, pending, processing, shipped, delivered, paidOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { orderStatus: 'PENDING' } }),
        prisma.order.count({ where: { orderStatus: 'PROCESSING' } }),
        prisma.order.count({ where: { orderStatus: 'SHIPPED' } }),
        prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
        prisma.order.findMany({
          where: { paymentStatus: 'PAID' },
          select: { totalAmount: true },
        }),
      ]);

    const totalRevenue = paidOrders.reduce(
      (sum: any, order: any) => sum + order.totalAmount,
      0
    );

    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      totalRevenue,
    };
  }

  /**
   * Delete order (admin only - use with caution)
   */
  async deleteOrder(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    logger.warn(`Order ${orderId} deleted by admin`);
  }
}

export default new AdminService();