import dotenv from 'dotenv';
dotenv.config();

export interface ServerConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  CLIENT_URL?: string;
  NVIDIA_API_KEY: string;
  NVIDIA_LOGIC_API_KEY: string;
  NVIDIA_APEX_API_KEY: string;
  SMTP_HOST?: string;
  SMTP_PORT: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  DEFAULT_MODEL: string;
  PRO_MODEL: string;
}

const nodeEnv = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
const port = Number(process.env.PORT) || 3001;

export const ENV: ServerConfig = {
  PORT: port,
  NODE_ENV: nodeEnv,
  CLIENT_URL: process.env.CLIENT_URL,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || '',
  NVIDIA_LOGIC_API_KEY: process.env.NVIDIA_LOGIC_API_KEY || process.env.NVIDIA_API_KEY || '',
  NVIDIA_APEX_API_KEY: process.env.NVIDIA_APEX_API_KEY || process.env.NVIDIA_API_KEY || '',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'meta/llama-3.2-11b-vision-instruct',
  PRO_MODEL: process.env.PRO_MODEL || 'meta/llama-3.2-90b-vision-instruct',
};

export const ALLOWED_ORIGINS: string[] = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(ENV.CLIENT_URL ? [ENV.CLIENT_URL] : [])
];

export function validateEnvironment(): void {
  if (ENV.NODE_ENV === 'production' && !ENV.NVIDIA_API_KEY) {
    console.warn('⚠️ [Config] NVIDIA_API_KEY is not defined in production environment.');
  }
}
