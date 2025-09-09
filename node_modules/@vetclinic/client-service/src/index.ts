import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './infrastructure/config/database';
import { MongoClientRepository } from './infrastructure/persistence/MongoClientRepository';
import { EventPublisher } from './infrastructure/messaging/EventPublisher';
import { CreateClientUseCase } from './application/use-cases/CreateClientUseCase';
import { GetClientUseCase } from './application/use-cases/GetClientUseCase';
import { GetAllClientsUseCase } from './application/use-cases/GetAllClientsUseCase';
import { UpdateClientUseCase } from './application/use-cases/UpdateClientUseCase';
import { DeleteClientUseCase } from './application/use-cases/DeleteClientUseCase';
import { ClientController } from './interfaces/controllers/ClientController';
import { createClientRoutes } from './interfaces/routes/clientRoutes';

dotenv.config();

const PORT = process.env.PORT || 3002;

const bootstrap = async () => {
  await connectDB(process.env.MONGODB_URI!);

  // Initialize RabbitMQ 
  // const eventPublisher = new EventPublisher(process.env.RABBITMQ_URL!);
  // await eventPublisher.connect();

  const clientRepository = new MongoClientRepository();

  const createClientUseCase = new CreateClientUseCase(clientRepository, {} as any);
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

  app.get('/health', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Client service is running',
      timestamp: new Date().toISOString()
    });
  });

  app.listen(PORT, () => {
    console.log(`Client service running on port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('\n Shutting down client service gracefully...');
    // await eventPublisher.disconnect();
    process.exit(0);
  });
};

bootstrap().catch(console.error);