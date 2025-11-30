import { Request, Response } from "express";
import paymentService from "./payment.service";
import catchAsync from "../../shared/utils/catchAsync";
import logger from "../../shared/utils/logger.util";

class PaymentController {
  /**
   * Stripe webhook endpoint
   * @route POST /api/payment/webhook/stripe
   */
  stripeWebhook = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      logger.error("Missing stripe signature");
      return res.status(400).json({
        success: false,
        message: "Missing stripe signature",
      });
    }

    const result = await paymentService.handleStripeWebhook(
      signature,
      req.body
    );

    res.json(result);
  });

  /**
   * Get payment status (for debugging)
   * @route GET /api/payment/status/:orderId
   */
  getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const status = await paymentService.getPaymentStatus(orderId as any);

    res.json({
      success: true,
      message: "Payment status retrieved",
      data: status,
    });
  });
}

export default new PaymentController();
