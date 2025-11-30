// Order related interfaces

export interface IOrderItem {
  title: string;
  price: number;
  quantity: number;
}

export enum PaymentMethod {
  STRIPE = "STRIPE",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
}

export interface IOrder {
  id: string;
  userId: string;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  stripePaymentIntentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrderInput {
  items: IOrderItem[];
  paymentMethod: "stripe";
}

export interface IStripePaymentData {
  clientSecret: string;
  paymentIntentId: string;
}

export type PaymentData = IStripePaymentData;

export interface ICreateOrderResponse {
  order: IOrder;
  payment: PaymentData;
}

export interface IOrderWithUser extends IOrder {
  user: {
    id: string;
    name: string;
    email: string;
  };
}
