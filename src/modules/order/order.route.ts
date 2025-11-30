import { Router } from "express";
import orderController from "./order.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validateRequest";
import { createOrderSchema, getOrderByIdSchema } from "./order.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  "/",
  validateRequest(createOrderSchema),
  orderController.createOrder
);

router.get("/", orderController.getUserOrders);

router.get(
  "/:id",
  validateRequest(getOrderByIdSchema),
  orderController.getOrderById
);

export default router;
