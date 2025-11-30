export interface IChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  createdAt: Date;
}

export interface IChatInput {
  message: string;
}

export interface IChatResponse {
  reply: string;
  timestamp: Date;
}

export interface IHuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

export interface IChatHistory {
  messages: IChatMessage[];
  total: number;
}