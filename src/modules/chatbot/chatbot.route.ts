import { Router } from "express";
import chatbotController from "./chatbot.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validateRequest";
import { chatSchema } from "./chatbot.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post("/", validateRequest(chatSchema), chatbotController.chat);

router.get("/history", chatbotController.getChatHistory);

router.delete("/history", chatbotController.deleteChatHistory);

export default router;
