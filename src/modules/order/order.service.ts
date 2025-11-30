import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import config from "../../shared/config/env";
import ApiError from "../../shared/errors/ApiError";
import {
  ICreateOrderInput,
  ICreateOrderResponse,
  IOrder,
  IOrderWithUser,
} from "./order.interface";

const prisma = new PrismaClient();
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-02-24.acacia",
});

class OrderService {
  /**
   * Create new order and initialize payment
   */
  async createOrder(
    userId: string,
    data: ICreateOrderInput
  ): Promise<ICreateOrderResponse> {
    // Calculate total amount
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Validate total amount
    if (totalAmount <= 0) {
      throw new ApiError(400, "Invalid order total amount");
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId,
        items: data.items,
        totalAmount,
        paymentMethod: "STRIPE",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Initialize Stripe payment
    const paymentData = await this.initializeStripePayment(
      order.id,
      totalAmount,
      userId
    );

    // Update order with Stripe payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentData.paymentIntentId },
    });

    return {
      order: order as any,
      payment: paymentData as any,
    };
  }

  /**
   * Initialize Stripe payment
   */
  private async initializeStripePayment(
    orderId: string,
    amount: number,
    userId: string
  ) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        orderId,
        userId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string): Promise<IOrder[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return orders as IOrder[];
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, userId: string): Promise<IOrder> {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order as IOrder;
  }

  /**
   * Get order by ID (Admin - any user's order)
   */
  async getOrderByIdAdmin(orderId: string): Promise<IOrderWithUser> {
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
      throw new ApiError(404, "Order not found");
    }

    return order as IOrderWithUser;
  }
}

export default new OrderService();
