import { PrismaClient } from "@prisma/client";
import axios from "axios";
import config from "../../shared/config/env";
import logger from "../../shared/utils/logger.util";
import { IChatResponse, IChatHistory } from "./chatbot.interface";

const prisma = new PrismaClient();

class ChatbotService {
  private readonly HUGGINGFACE_API =
    "https://api-inference.huggingface.co/models/google/flan-t5-base";
  private readonly MAX_RETRIES = 2;
  private readonly TIMEOUT = 10000; // 10 seconds

  /**
   * Chat with AI bot
   */
  async chat(userId: string, message: string): Promise<IChatResponse> {
    try {
      // Get recent messages for context (last 3)
      const recentMessages = await this.getRecentMessages(userId, 3);

      // Build context
      const context = this.buildContext(recentMessages, message);

      // Call AI API with retries
      let botResponse = await this.callAIWithRetry(context);

      // Clean response
      botResponse = this.cleanResponse(botResponse, context);

      // Fallback if response is empty
      if (!botResponse || botResponse.length < 5) {
        botResponse = this.getFallbackResponse(message);
      }

      // Save to database
      await prisma.chatMessage.create({
        data: {
          userId,
          message,
          response: botResponse,
        },
      });

      logger.info(`Chat response generated for user ${userId}`);

      return {
        reply: botResponse,
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error("Chatbot error:", error);

      // Use fallback response on error
      const fallbackResponse = this.getFallbackResponse(message);

      // Still save to database
      await prisma.chatMessage.create({
        data: {
          userId,
          message,
          response: fallbackResponse,
        },
      });

      return {
        reply: fallbackResponse,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Call AI API with retry logic
   */
  private async callAIWithRetry(prompt: string): Promise<string> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await axios.post(
          this.HUGGINGFACE_API,
          {
            inputs: prompt,
            parameters: {
              max_length: 200,
              temperature: 0.7,
              do_sample: true,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${config.huggingface.apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: this.TIMEOUT,
          }
        );

        // Extract response
        if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          return response.data[0].generated_text;
        } else if (response.data.generated_text) {
          return response.data.generated_text;
        }

        logger.warn(`AI API returned unexpected format on attempt ${attempt}`);
      } catch (error: any) {
        lastError = error;
        logger.error(`AI API call failed (attempt ${attempt}):`, error.message);

        // Wait before retry
        if (attempt < this.MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Get recent messages for context
   */
  private async getRecentMessages(userId: string, limit: number) {
    return prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        message: true,
        response: true,
      },
    });
  }

  /**
   * Build context from recent messages
   */
  private buildContext(recentMessages: any[], currentMessage: string): string {
    let context =
      "You are a helpful e-commerce assistant. Answer customer questions about products, orders, and provide recommendations.\n\n";

    if (recentMessages.length > 0) {
      const reversed = [...recentMessages].reverse();
      context += "Recent conversation:\n";
      reversed.forEach((msg) => {
        context += `Customer: ${msg.message}\nAssistant: ${msg.response}\n`;
      });
    }

    context += `\nCustomer: ${currentMessage}\nAssistant:`;

    return context;
  }

  /**
   * Clean AI response
   */
  private cleanResponse(response: string, prompt: string): string {
    let cleaned = response.replace(prompt, "").trim();

    cleaned = cleaned.replace(/^Assistant:\s*/i, "");

    const sentences = cleaned.split(". ").filter(Boolean);

    if (sentences.length > 1) {
      const last: any = sentences[sentences.length - 1];
      if (last.length < 20) {
        sentences.pop();
      }
    }

    return sentences.join(". ") + (sentences.length > 1 ? "." : "");
  }

  /**
   * Get fallback response based on message content
   */
  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Gaming products
    if (lowerMessage.includes("gaming") || lowerMessage.includes("game")) {
      return "Check out our gaming products - Gaming Mouse X500 and Mechanical Keyboards with RGB lighting. They offer fast response times and are highly rated by gamers.";
    }

    // Order tracking
    if (
      lowerMessage.includes("order") ||
      lowerMessage.includes("track") ||
      lowerMessage.includes("delivery")
    ) {
      return "You can view your order status in the Orders section. Please provide your order ID for specific order inquiries.";
    }

    // Payment
    if (
      lowerMessage.includes("payment") ||
      lowerMessage.includes("pay") ||
      lowerMessage.includes("card")
    ) {
      return "We accept payments through Stripe. All payments are secure and processed instantly. You will receive real-time order updates.";
    }

    // Return/Refund
    if (
      lowerMessage.includes("return") ||
      lowerMessage.includes("refund") ||
      lowerMessage.includes("cancel")
    ) {
      return "We offer a 30-day return policy. To initiate a return, please contact our support team with your order details.";
    }

    // Product recommendations
    if (
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("suggest") ||
      lowerMessage.includes("best")
    ) {
      return "It depends on your specific needs. For gaming, I recommend high-performance peripherals, and for work, ergonomic products are best. Please provide more details for better suggestions.";
    }

    // Default response
    return "Thank you for your question! I can help with product recommendations, order inquiries, and general questions. Please tell me more details about what you need.";
  }

  /**
   * Get chat history
   */
  async getChatHistory(
    userId: string,
    limit: number = 10
  ): Promise<IChatHistory> {
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const total = await prisma.chatMessage.count({
      where: { userId },
    });

    return {
      messages: messages as any,
      total,
    };
  }

  /**
   * Delete chat history
   */
  async deleteChatHistory(userId: string): Promise<void> {
    await prisma.chatMessage.deleteMany({
      where: { userId },
    });

    logger.info(`Chat history deleted for user ${userId}`);
  }
}

export default new ChatbotService();
