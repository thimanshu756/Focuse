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
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'Google Client Secret is required'),
  // Razorpay Configuration
  RAZORPAY_KEY_ID: z.string().min(1, 'Razorpay Key ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'Razorpay Key Secret is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'Razorpay Webhook Secret is required'),
  // Razorpay Plan IDs
  RAZORPAY_PLAN_MONTHLY: z.string().optional(), // Optional until plans are created in Razorpay
  RAZORPAY_PLAN_YEARLY: z.string().optional(),
  // Payment Configuration
  PAYMENT_TIMEOUT_SECONDS: z.string().transform(Number).default('600'), // 10 minutes
  PENDING_SUBSCRIPTION_TIMEOUT_MINUTES: z.string().transform(Number).default('30'), // 30 minutes (5 minutes in dev)
  ENABLE_SUBSCRIPTIONS: z.string().transform((val) => val === 'true').default('true'),
});

export const env = envSchema.parse(process.env);

