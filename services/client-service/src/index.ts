import express from 'express';
import cors from 'cors';
import { database } from './infrastructure/config/database';
import { MongoClientRepository } from './infrastructure/persistence/MongoClientRepository';
import { MongoPetRepository } from './infrastructure/persistence/MongoPetRepository';
import { MongoAwardRepository } from './infrastructure/persistence/MongoAwardRepository';
import { CreateClientUseCase } from './application/use-cases/CreateClientUseCase';
import { GetClientUseCase } from './application/use-cases/GetClientUseCase';
import { GetAllClientsUseCase } from './application/use-cases/GetAllClientsUseCase';
import { UpdateClientUseCase } from './application/use-cases/UpdateClientUseCase';
import { DeleteClientUseCase } from './application/use-cases/DeleteClientUseCase';
import { ClientController } from './interfaces/controllers/ClientController';
import { createClientRoutes } from './interfaces/routes/clientRoutes';
import { createPetRoutes } from './interfaces/routes/petRoutes';
import { createAwardRoutes } from './interfaces/routes/awardRoutes';
 
import { CreatePetUseCase } from './application/use-cases/pets/CreatePetUseCase';
import { GetPetUseCase } from './application/use-cases/pets/GetPetUseCase';
import { GetAllPetsUseCase } from './application/use-cases/pets/GetAllPetsUseCase';
import { GetPetsByClientUseCase } from './application/use-cases/pets/GetPetsByClientUseCase';
import { UpdatePetUseCase } from './application/use-cases/pets/UpdatePetUseCase';
import { DeletePetUseCase } from './application/use-cases/pets/DeletePetUseCase';
import { SearchPetsUseCase } from './application/use-cases/pets/SearchPetsUseCase';
import { AddVaccinationRecordUseCase } from './application/use-cases/pets/AddVaccinationRecordUseCase';
import { CompleteVaccinationUseCase } from './application/use-cases/pets/CompleteVaccinationUseCase';
import { GetPetStatsUseCase } from './application/use-cases/pets/GetPetStatsUseCase';
import { UpdateClientProfileImageUseCase } from './application/use-cases/UpdateClientProfileImageUseCase';
import { GrantAwardUseCase } from './application/use-cases/awards/GrantAwardUseCase';
import { GetAwardUseCase } from './application/use-cases/awards/GetAwardUseCase';
import { GetAllAwardsUseCase } from './application/use-cases/awards/GetAllAwardsUseCase';
import { GetPetAwardsUseCase } from './application/use-cases/awards/GetPetAwardsUseCase';
import { UpdateAwardUseCase } from './application/use-cases/awards/UpdateAwardUseCase';
import { RevokeAwardUseCase } from './application/use-cases/awards/RevokeAwardUseCase';
import { GetClientAwardsUseCase } from './application/use-cases/awards/GetClientAwardsUseCase';
import { GetAwardStatsUseCase } from './application/use-cases/awards/GetAwardStatsUseCase';
import { UpdatePetProfileImageUseCase } from './application/use-cases/pets/UpdatePetProfileImageUseCase'; 
import { PetController } from './interfaces/controllers/PetController';
import { AwardController } from './interfaces/controllers/AwardController';

import { EventConsumer } from './domain/events/EventConsumer';
import { ClientCreatedEventHandler } from './domain/events/handlers/ClientCreatedEventHandler';

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
    const petRepository = new MongoPetRepository();
    const awardRepository = new MongoAwardRepository();
     
    const createClientUseCase = new CreateClientUseCase(clientRepository);
    const getClientUseCase = new GetClientUseCase(clientRepository);
    const getAllClientsUseCase = new GetAllClientsUseCase(clientRepository);
    const updateClientUseCase = new UpdateClientUseCase(clientRepository);
    const deleteClientUseCase = new DeleteClientUseCase(clientRepository);
    const updateClientProfileImageUseCase = new UpdateClientProfileImageUseCase(clientRepository);
    const createPetUseCase = new CreatePetUseCase(petRepository, clientRepository);
    const getPetUseCase = new GetPetUseCase(petRepository);
    const getPetsByClientUseCase = new GetPetsByClientUseCase(petRepository, clientRepository);
    const updatePetUseCase = new UpdatePetUseCase(petRepository);
    const deletePetUseCase = new DeletePetUseCase(petRepository);
    const getAllPetsUseCase = new GetAllPetsUseCase(petRepository);
    const searchPetsUseCase = new SearchPetsUseCase(petRepository);
    const addVaccinationRecordUseCase = new AddVaccinationRecordUseCase(petRepository);
    const completeVaccinationUseCase = new CompleteVaccinationUseCase(petRepository);
    const getPetStatsUseCase = new GetPetStatsUseCase(petRepository);
    const updatePetProfileImageUseCase = new UpdatePetProfileImageUseCase(petRepository);  

    const petController = new PetController(
      createPetUseCase,
      getPetUseCase,
      getPetsByClientUseCase,
      updatePetUseCase,
      deletePetUseCase,
      getAllPetsUseCase,
      searchPetsUseCase,
      addVaccinationRecordUseCase,
      completeVaccinationUseCase,
      getPetStatsUseCase,
      updatePetProfileImageUseCase, 
    );
    const grantAwardUseCase = new GrantAwardUseCase(awardRepository, petRepository, clientRepository);
    const getPetAwardsUseCase = new GetPetAwardsUseCase(awardRepository, petRepository);
    const getAwardUseCase = new GetAwardUseCase(awardRepository);
    const updateAwardUseCase = new UpdateAwardUseCase(awardRepository);
    const revokeAwardUseCase = new RevokeAwardUseCase(awardRepository);
    const getClientAwardsUseCase = new GetClientAwardsUseCase(awardRepository, clientRepository);
    const getAllAwardsUseCase = new GetAllAwardsUseCase(awardRepository);
    const getAwardStatsUseCase = new GetAwardStatsUseCase(awardRepository);
    
 
    const clientController = new ClientController(
      createClientUseCase,
      getClientUseCase,
      getAllClientsUseCase,
      updateClientUseCase,
      deleteClientUseCase,
      updateClientProfileImageUseCase,
      petRepository
    ); 

    const awardController = new AwardController(
      grantAwardUseCase,
      getPetAwardsUseCase,
      getAwardUseCase,
      updateAwardUseCase,
      revokeAwardUseCase,
      getClientAwardsUseCase,
      getAllAwardsUseCase,
      getAwardStatsUseCase
    );

    console.log('Setting up event consumers...');
    
    try {
      const eventConsumer = new EventConsumer(RABBITMQ_URL);
      
      const clientCreatedEventHandler = new ClientCreatedEventHandler(createClientUseCase);
      eventConsumer.registerHandler('ClientCreatedEvent', clientCreatedEventHandler);
      
      await eventConsumer.startConsuming();
      console.log('Event consumers started successfully');
    } catch (error) {
      console.error('Event consumer failed to start, but continuing service startup:', error);
    }

    const app = express();
    
    app.use(cors({
      origin: 'http://localhost:3007',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }));

    app.use(express.json());
     
    app.use('/api', createClientRoutes(clientController));
    app.use('/api/client-pets', createPetRoutes(petController));
    app.use('/api/client-pets-awards', createAwardRoutes(awardController));
    
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
      console.log(`Client routes: http://localhost:${PORT}/api/clients`);
      console.log(`Pet routes: http://localhost:${PORT}/api/client-pets`);
      console.log(`Award routes: http://localhost:${PORT}/api/client-pets-awards`);
      console.log(`Event consumers listening for ClientCreatedEvent`);
    });
    
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
      
      try {
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
