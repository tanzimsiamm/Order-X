import { z } from 'zod';

// Chat message schema
export const chatSchema = z.object({
  body: z.object({
    message: z
      .string({
        required_error: 'Message is required',
      })
      .min(1, 'Message cannot be empty')
      .max(500, 'Message is too long (max 500 characters)'),
  }),
});

// Get chat history schema
export const getChatHistorySchema = z.object({
  query: z.object({
    limit: z.string().optional().default('10'),
  }),
});

// Type inference
export type ChatInput = z.infer<typeof chatSchema>['body'];
export type GetChatHistoryQuery = z.infer<typeof getChatHistorySchema>['query'];