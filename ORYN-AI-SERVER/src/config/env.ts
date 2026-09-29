import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || '',
  NVIDIA_LOGIC_API_KEY: process.env.NVIDIA_LOGIC_API_KEY || process.env.NVIDIA_API_KEY || '',
  NVIDIA_APEX_API_KEY: process.env.NVIDIA_APEX_API_KEY || process.env.NVIDIA_API_KEY || '',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  DEFAULT_MODEL: 'meta/llama-3.2-11b-vision-instruct',
  PRO_MODEL: 'meta/llama-3.2-90b-vision-instruct',
};

export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(ENV.CLIENT_URL ? [ENV.CLIENT_URL] : [])
];
