export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequestDto {
  messages: ChatMessage[];
  webSearch?: boolean;
  taskExtract?: boolean;
  model?: string;
  language?: string;
}
