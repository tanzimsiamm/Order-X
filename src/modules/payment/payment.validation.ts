import { z } from "zod";

// Get payment status schema
export const getPaymentStatusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, "Order ID is required"),
  }),
});

// Stripe webhook validation (body will be raw)
// Note: Stripe signature verification is done in the service layer
export const stripeWebhookSchema = z.object({
  headers: z.object({
    "stripe-signature": z.string({
      required_error: "Stripe signature is required",
    }),
  }),
});

// Type inference
export type GetPaymentStatusParams = z.infer<
  typeof getPaymentStatusSchema
>["params"];
