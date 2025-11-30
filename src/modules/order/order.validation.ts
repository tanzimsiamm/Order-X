import { z } from "zod";

// Order item schema
const orderItemSchema = z.object({
  title: z.string().min(1, "Item title is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().positive("Quantity must be positive integer"),
});

// Create order schema
export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(orderItemSchema)
      .min(1, "At least one item is required")
      .max(50, "Maximum 50 items allowed per order"),
    paymentMethod: z.literal("stripe", {
      errorMap: () => ({ message: "Payment method must be stripe" }),
    }),
  }),
});

// Get order by ID schema
export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
});

// Type inference
export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type GetOrderByIdParams = z.infer<typeof getOrderByIdSchema>["params"];
