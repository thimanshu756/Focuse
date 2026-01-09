import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
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

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Forest Focus Timer API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
});

export default app;

