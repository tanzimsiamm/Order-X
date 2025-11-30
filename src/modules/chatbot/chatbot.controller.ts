import { Response } from "express";
import chatbotService from "./chatbot.service";
import { sendSuccessResponse } from "../../shared/utils/response.util";
import catchAsync from "../../shared/utils/catchAsync";
import { IAuthRequest } from "../../shared/interfaces/common.interface";

class ChatbotController {
  /**
   * Chat with AI bot
   * @route POST /api/chatbot
   */
  chat = catchAsync(async (req: IAuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { message } = req.body;

    const result = await chatbotService.chat(userId, message);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Response generated successfully",
      data: result,
    });
  });

  /**
   * Get chat history
   * @route GET /api/chatbot/history
   */
  getChatHistory = catchAsync(async (req: IAuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await chatbotService.getChatHistory(userId, limit);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Chat history retrieved successfully",
      data: result,
    });
  });

  /**
   * Delete chat history
   * @route DELETE /api/chatbot/history
   */
  deleteChatHistory = catchAsync(async (req: IAuthRequest, res: Response) => {
    const userId = req.user!.userId;

    await chatbotService.deleteChatHistory(userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Chat history deleted successfully",
    });
  });
}

export default new ChatbotController();
