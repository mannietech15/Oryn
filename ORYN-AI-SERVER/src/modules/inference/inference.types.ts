export type ModelCapability = 'text' | 'vision' | 'image-generation' | 'json' | 'streaming';

export type ModelTier = 'default' | 'pro' | 'logic' | 'apex' | string;

export interface MessageContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface InferenceMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | MessageContentPart[];
}

export interface GenerationRequest {
  model?: ModelTier;
  messages: InferenceMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: 'json_object' | 'text' };
  signal?: AbortSignal;
}

export interface GenerationResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface StreamChunk {
  text: string;
  done?: boolean;
}

export interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  filename: string;
  htmlMarkup: string;
}
