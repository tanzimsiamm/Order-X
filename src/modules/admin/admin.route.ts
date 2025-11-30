import { Router } from "express";
import adminController from "./admin.controller";
import {
  authenticate,
  authorizeAdmin,
} from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validateRequest";
import { updateOrderStatusSchema } from "./admin.validation";

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorizeAdmin);

router.get("/orders", adminController.getAllOrders);

router.get("/orders/:id", adminController.getOrderById);

router.patch(
  "/orders/:id/status",
  validateRequest(updateOrderStatusSchema),
  adminController.updateOrderStatus
);

router.delete("/orders/:id", adminController.deleteOrder);

router.get("/stats", adminController.getOrderStats);

export default router;
