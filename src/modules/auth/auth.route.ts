import { Router } from "express";
import authController from "./auth.controller";
import { validateRequest } from "../../shared/middlewares/validateRequest";
import { loginSchema, registerSchema } from "./auth.validation";
import { authenticate } from "../../shared/middlewares/auth.middleware";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);

router.post("/login", validateRequest(loginSchema), authController.login);

router.get("/me", authenticate, authController.getProfile);

export default router;
