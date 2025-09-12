import express from 'express';
import cors from 'cors';
import { database } from './infrastructure/config/database';
import { MongoAppointmentRepository } from './infrastructure/persistence/MongoAppointmentRepository';
import { EventPublisher } from './infrastructure/messaging/EventPublisher';
import { EventConsumer } from './infrastructure/messaging/EventConsumer';
import { CreateAppointmentUseCase } from './application/use-cases/CreateAppointmentUseCase';
import { GetAppointmentUseCase } from './application/use-cases/GetAppointmentUseCase';
import { GetAppointmentsByVetUseCase } from './application/use-cases/GetAppointmentsByVetUseCase';
import { GetAppointmentsByClientUseCase } from './application/use-cases/GetAppointmentsByClientUseCase';
import { ConfirmAppointmentUseCase } from './application/use-cases/ConfirmAppointmentUseCase';
import { CancelAppointmentUseCase } from './application/use-cases/CancelAppointmentUseCase';
import { CompleteAppointmentUseCase } from './application/use-cases/CompleteAppointmentUseCase';
import { StartAppointmentUseCase } from './application/use-cases/StartAppointmentUseCase'; 
import { AppointmentController } from './interfaces/controllers/AppointmentController';
import { createAppointmentRoutes } from './interfaces/routes/appointmentRoutes';

const PORT = process.env.PORT || 3004;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetclinic-appointments';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

const bootstrap = async () => {
  try {
    console.log('Starting Appointment Service...');
    
    console.log('Connecting to MongoDB...');
    await database.connect({
      uri: MONGODB_URI,
      options: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
      }
    });
    console.log('Connected to MongoDB successfully');

    console.log('Creating database indexes...');
    await database.createIndexes();
    console.log('Database indexes created successfully');

    const appointmentRepository = new MongoAppointmentRepository();
    const eventPublisher = new EventPublisher(RABBITMQ_URL);
    const eventConsumer = new EventConsumer(RABBITMQ_URL);
    
    await eventPublisher.connect();
    await eventConsumer.connect();
    
    const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentRepository, eventPublisher);
    const getAppointmentUseCase = new GetAppointmentUseCase(appointmentRepository);
    const getAppointmentsByVetUseCase = new GetAppointmentsByVetUseCase(appointmentRepository);
    const getAppointmentsByClientUseCase = new GetAppointmentsByClientUseCase(appointmentRepository);
    const confirmAppointmentUseCase = new ConfirmAppointmentUseCase(appointmentRepository, eventPublisher);
    const cancelAppointmentUseCase = new CancelAppointmentUseCase(appointmentRepository, eventPublisher);
    const completeAppointmentUseCase = new CompleteAppointmentUseCase(appointmentRepository, eventPublisher);
    const startAppointmentUseCase = new StartAppointmentUseCase(appointmentRepository, eventPublisher); 
    
    const appointmentController = new AppointmentController(
      createAppointmentUseCase,
      getAppointmentUseCase,
      getAppointmentsByVetUseCase,
      getAppointmentsByClientUseCase,
      confirmAppointmentUseCase,
      cancelAppointmentUseCase,
      completeAppointmentUseCase,
      startAppointmentUseCase 
    );
    
    const app = express();
    app.use(cors());
    app.use(express.json());
    
    app.use('/api', createAppointmentRoutes(appointmentController));
    
    app.get('/health', async (req, res) => {
      try {
        const dbHealth = await database.healthCheck();
        res.json({ 
          success: true, 
          message: 'Appointment service is running',
          database: dbHealth ? 'connected' : 'disconnected',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Health check failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    app.listen(PORT, () => {
      console.log(`Appointment service running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
    
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
      
      try {
        await eventPublisher.disconnect();
        console.log('RabbitMQ publisher disconnected');
        
        await eventConsumer.disconnect();
        console.log('RabbitMQ consumer disconnected');
        
        await database.disconnect();
        console.log('MongoDB connection closed');
        
        console.log('Shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
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
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap().catch((error) => {
  console.error('Fatal error in bootstrap:', error);
  process.exit(1);
});
