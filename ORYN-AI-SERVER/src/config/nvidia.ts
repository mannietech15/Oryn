import OpenAI from 'openai';
import { ENV } from './env';

export const openai = new OpenAI({
  apiKey: ENV.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
  timeout: 30000,
});

export const openaiLogic = new OpenAI({
  apiKey: ENV.NVIDIA_LOGIC_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
  timeout: 30000,
});

export const openaiApex = new OpenAI({
  apiKey: ENV.NVIDIA_APEX_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
  timeout: 30000,
});
