// Payment webhook interfaces

import Stripe from "stripe";

export interface IStripeWebhookPayload {
  id: string;
  type: string;
  data: {
    object: Stripe.PaymentIntent;
  };
}

export enum WebhookEventType {
  STRIPE_PAYMENT_SUCCESS = "payment_intent.succeeded",
  STRIPE_PAYMENT_FAILED = "payment_intent.payment_failed",
}

export interface IWebhookResponse {
  received: boolean;
  message?: string;
}

export interface IPaymentStatus {
  id: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: Date;
}
