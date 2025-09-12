import express from 'express';
import cors from 'cors';
import { database } from './infrastructure/config/database';
import { MongoClientRepository } from './infrastructure/persistence/MongoClientRepository';
import { EventPublisher } from './infrastructure/messaging/EventPublisher';
import { CreateClientUseCase } from './application/use-cases/CreateClientUseCase';
import { GetClientUseCase } from './application/use-cases/GetClientUseCase';
import { GetAllClientsUseCase } from './application/use-cases/GetAllClientsUseCase';
import { UpdateClientUseCase } from './application/use-cases/UpdateClientUseCase';
import { DeleteClientUseCase } from './application/use-cases/DeleteClientUseCase';
import { ClientController } from './interfaces/controllers/ClientController';
import { createClientRoutes } from './interfaces/routes/clientRoutes';

const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetclinic-clients';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

const bootstrap = async () => {
  try {
    console.log('Starting Client Service...');
    
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

    const clientRepository = new MongoClientRepository();
    
    const eventPublisher = new EventPublisher(RABBITMQ_URL);
    await eventPublisher.connect();
    
    const createClientUseCase = new CreateClientUseCase(clientRepository);
    const getClientUseCase = new GetClientUseCase(clientRepository);
    const getAllClientsUseCase = new GetAllClientsUseCase(clientRepository);
    const updateClientUseCase = new UpdateClientUseCase(clientRepository);
    const deleteClientUseCase = new DeleteClientUseCase(clientRepository);

    const clientController = new ClientController(
      createClientUseCase,
      getClientUseCase,
      getAllClientsUseCase,
      updateClientUseCase,
      deleteClientUseCase
    );

    const app = express();
    app.use(cors());
    app.use(express.json());
    
    app.use('/api', createClientRoutes(clientController));
    
    app.get('/health', async (_req, res) => {
      try {
        const dbHealth = await database.healthCheck();
        res.json({ 
          success: true, 
          message: 'Client service is running',
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
      console.log(`Client service running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
    
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
      
      try {
        await eventPublisher.disconnect();
        console.log('RabbitMQ publisher disconnected');
        
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
