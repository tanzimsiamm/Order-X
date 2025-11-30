import { Router } from "express";
import paymentController from "./payment.controller";

const router = Router();

router.post("/webhook/stripe", paymentController.stripeWebhook);

router.get("/status/:orderId", paymentController.getPaymentStatus);

export default router;
