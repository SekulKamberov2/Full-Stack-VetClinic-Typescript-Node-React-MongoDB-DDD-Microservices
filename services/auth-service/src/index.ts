import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { database } from './config/database';
import authRoutes from './routes/authRoutes';
import { ErrorHandler } from '@vetclinic/shared-kernel';

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-service';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);

app.get('/health', async (_req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0',
      database: dbHealth ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      database: 'error'
    });
  }
});

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Authentication Service API',
    version: '1.0.0',
    health: '/health',
    endpoints: {
      auth: '/api/auth'
    }
  });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  ErrorHandler.handleAppError(error, 'Express error handler');
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const bootstrap = async (): Promise<void> => {
  try {
    console.log('Starting Authentication Service...');
    
    console.log('Connecting to MongoDB...');
    await database.connect({
      uri: MONGODB_URI,
      options: {
        maxPoolSize: 10,
        minPoolSize: 2,
      }
    });

    console.log('Creating database indexes...');
    await database.createIndexes();

    const server = app.listen(PORT, () => {
      console.log('Authentication Service Started Successfully');
      console.log('============================================');
      console.log(`Server running on port: ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`MongoDB: ${MONGODB_URI}`);
      console.log('============================================\n');
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('Error closing server:', err);
          process.exit(1);
        }
        
        try {
          console.log('Closing database connection...');
          await database.disconnect();
          console.log('All connections closed successfully');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('Fatal error during application startup:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap().catch((error) => {
  console.error('Fatal error in bootstrap:', error);
  process.exit(1);
});
