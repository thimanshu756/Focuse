import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  // Email configuration (Gmail)
  GMAIL_USER: z.string().email('Invalid Gmail user email'),
  GMAIL_APP_PASSWORD: z.string().min(1, 'Gmail app password is required'),
  FRONTEND_URL: z.string().url('Invalid frontend URL').default('http://localhost:3000'),
  // AI Configuration
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required'),
});

export const env = envSchema.parse(process.env);

