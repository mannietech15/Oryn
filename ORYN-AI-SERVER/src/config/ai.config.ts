import { ENV } from './env';

export interface ModelTierConfig {
  id: string;
  name: string;
  maxTokens?: number;
  temperature?: number;
  supportsMultimodal: boolean;
  supportsStreaming: boolean;
}

export const AI_CONFIG = {
  nvidia: {
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    timeoutMs: 30000,
    maxRetries: 3,
    retryDelaysMs: [2000, 5000, 10000],
  },
  models: {
    default: {
      id: ENV.DEFAULT_MODEL,
      name: 'Default Vision',
      supportsMultimodal: true,
      supportsStreaming: true,
    } as ModelTierConfig,
    pro: {
      id: ENV.PRO_MODEL,
      name: 'Pro Vision Instruct',
      supportsMultimodal: true,
      supportsStreaming: true,
    } as ModelTierConfig,
    logic: {
      id: ENV.DEFAULT_MODEL,
      name: 'Logic Optimized',
      supportsMultimodal: false,
      supportsStreaming: true,
    } as ModelTierConfig,
    apex: {
      id: ENV.PRO_MODEL,
      name: 'Apex Tier',
      supportsMultimodal: true,
      supportsStreaming: true,
    } as ModelTierConfig,
  },
  imageGeneration: {
    baseUrl: 'https://image.pollinations.ai/prompt',
    defaultDimension: 800,
  }
};
