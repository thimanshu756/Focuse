import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import sessionRoutes from './routes/session.routes.js';
import syncRoutes from './routes/sync.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

// Load environment variables
dotenv.config();

// Validate environment variables on startup
try {
  env;
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}

const app: Express = express();
const PORT = env.PORT;

// Middleware
app.use(cors());

// Webhook routes MUST be registered BEFORE express.json()
// because they need raw body for signature verification
app.use('/api/v1/webhooks', webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Server is running but database connection failed',
      database: 'disconnected'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Forest Focus Timer API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      tasks: '/api/tasks',
      sessions: '/api/sessions',
      sync: '/api/sync',
      insights: '/api/insights',
      subscription: '/api/v1/subscription',
      webhooks: '/api/v1/webhooks',
    }
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
});

// Set server timeout to 2 minutes (for AI operations that may take longer)
// Individual routes can override this with their own timeout middleware
server.timeout = 120000; // 2 minutes
server.keepAliveTimeout = 65000; // Keep connections alive
server.headersTimeout = 66000; // Slightly longer than keepAliveTimeout

export default app;

