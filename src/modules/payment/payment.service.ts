import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import config from "../../shared/config/env";
import { emitToUser } from "../../shared/socket/socket";
import ApiError from "../../shared/errors/ApiError";
import logger from "../../shared/utils/logger.util";

const prisma = new PrismaClient();
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-02-24.acacia",
});

class PaymentService {
  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(signature: string, body: Buffer) {
    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err: any) {
      logger.error("Stripe webhook signature verification failed:", err);
      throw new ApiError(
        400,
        `Webhook signature verification failed: ${err.message}`
      );
    }

    logger.info(`Stripe webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        const successIntent = event.data.object as Stripe.PaymentIntent;
        await this.updateOrderPaymentStatus(successIntent.id, "PAID");
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await this.updateOrderPaymentStatus(failedIntent.id, "FAILED");
        break;

      default:
        logger.warn(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Update order payment status
   * CRITICAL: This is the ONLY place where payment status is updated
   */
  private async updateOrderPaymentStatus(
    paymentIntentId: string,
    status: "PAID" | "FAILED"
  ) {
    try {
      // Find order by Stripe payment intent ID
      const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
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
        logger.error(
          `Order not found for payment intent ID: ${paymentIntentId}`
        );
        return;
      }

      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: status,
          orderStatus: status === "PAID" ? "PROCESSING" : order.orderStatus,
        },
      });

      logger.info(
        `Order ${order.id} payment status updated to ${status} via STRIPE`
      );

      // Send real-time notification to user
      const notificationMessage =
        status === "PAID"
          ? "💰 Payment successful! Your order is now being processed."
          : "❌ Payment failed. Please try again or contact support.";

      emitToUser(order.userId, "orderUpdate", {
        orderId: updatedOrder.id,
        paymentStatus: updatedOrder.paymentStatus,
        orderStatus: updatedOrder.orderStatus,
        message: notificationMessage,
        timestamp: new Date(),
      });

      logger.info(`Real-time notification sent to user ${order.userId}`);
    } catch (error: any) {
      logger.error("Error updating order payment status:", error);
      throw error;
    }
  }

  /**
   * Get payment status for an order
   */
  async getPaymentStatus(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        paymentStatus: true,
        paymentMethod: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order;
  }
}

export default new PaymentService();
