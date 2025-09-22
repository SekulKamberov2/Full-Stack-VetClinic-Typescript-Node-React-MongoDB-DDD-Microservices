import express from 'express';
import cors from 'cors';
import { database } from './infrastructure/config/database';
import { MongoPatientRepository } from './infrastructure/persistence/MongoPatientRepository';
import { EventConsumer } from './infrastructure/messaging/EventConsumer';
import { GetPatientsByOwnerUseCase } from './application/use-cases/GetPatientsByOwnerUseCase';
import { CreatePatientUseCase } from './application/use-cases/CreatePatientUseCase';
import { GetPatientUseCase } from './application/use-cases/GetPatientUseCase';
import { GetAllPatientsUseCase } from './application/use-cases/GetAllPatientsUseCase';
import { UpdatePatientUseCase } from './application/use-cases/UpdatePatientUseCase';
import { PartialUpdatePatientUseCase } from './application/use-cases/PartialUpdatePatientUseCase'; 
import { DeletePatientUseCase } from './application/use-cases/DeletePatientUseCase';
import { PatientController } from './interfaces/controllers/PatientController';
import { createPatientRoutes } from './interfaces/routes/patientRoutes';

const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetclinic-patients';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

const bootstrap = async () => {
  try {
    console.log('Starting Patient Service...');
    
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

    const patientRepository = new MongoPatientRepository();
    
    const eventConsumer = new EventConsumer(RABBITMQ_URL);
    await eventConsumer.connect();
    
    const getPatientsByOwnerUseCase = new GetPatientsByOwnerUseCase(patientRepository);
    const createPatientUseCase = new CreatePatientUseCase(patientRepository);
    const getPatientUseCase = new GetPatientUseCase(patientRepository);
    const getAllPatientsUseCase = new GetAllPatientsUseCase(patientRepository);
    const updatePatientUseCase = new UpdatePatientUseCase(patientRepository);
    const partialUpdatePatientUseCase = new PartialUpdatePatientUseCase(patientRepository);
    const deletePatientUseCase = new DeletePatientUseCase(patientRepository);

    const patientController = new PatientController(
      getPatientsByOwnerUseCase,
      createPatientUseCase,
      getPatientUseCase,
      getAllPatientsUseCase,
      updatePatientUseCase,
      partialUpdatePatientUseCase,
      deletePatientUseCase
    );

    const app = express();
    app.use(cors());
    app.use(express.json());
    
    app.use('/api', createPatientRoutes(patientController));
    
    app.get('/health', async (req, res) => {
      try {
        const dbHealth = await database.healthCheck();
        res.json({ 
          success: true, 
          message: 'Patient service is running',
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
      console.log(`Patient service running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
    
    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      
      try {
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
