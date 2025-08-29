import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './infrastructure/config/database';
import { MongoPatientRepository } from './infrastructure/persistence/MongoPatientRepository';
import { EventConsumer } from './infrastructure/messaging/EventConsumer';
import { GetPatientsByOwnerUseCase } from './application/use-cases/GetPatientsByOwnerUseCase';
import { CreatePatientUseCase } from './application/use-cases/CreatePatientUseCase';
import { GetPatientUseCase } from './application/use-cases/GetPatientUseCase';
import { GetAllPatientsUseCase } from './application/use-cases/GetAllPatientsUseCase';
import { UpdatePatientUseCase } from './application/use-cases/UpdatePatientUseCase';
import { DeletePatientUseCase } from './application/use-cases/DeletePatientUseCase';
import { HandleClientCreatedUseCase } from './application/use-cases/HandleClientCreatedUseCase';
import { PatientController } from './interfaces/controllers/PatientController';
import { createPatientRoutes } from './interfaces/routes/patientRoutes';

dotenv.config();

const PORT = process.env.PORT || 3003;

const bootstrap = async () => {
  await connectDB(process.env.MONGODB_URI!);

  const patientRepository = new MongoPatientRepository();

  const getPatientsByOwnerUseCase = new GetPatientsByOwnerUseCase(patientRepository);
  const createPatientUseCase = new CreatePatientUseCase(patientRepository);
  const getPatientUseCase = new GetPatientUseCase(patientRepository);
  const getAllPatientsUseCase = new GetAllPatientsUseCase(patientRepository);
  const updatePatientUseCase = new UpdatePatientUseCase(patientRepository);
  const deletePatientUseCase = new DeletePatientUseCase(patientRepository);
  const handleClientCreatedUseCase = new HandleClientCreatedUseCase(patientRepository);

  // initialize rabitMQ consumer (commented for now)
  // const eventConsumer = new EventConsumer(process.env.RABBITMQ_URL!);
  // await eventConsumer.connect();
  // await eventConsumer.consume(
  //   process.env.CLIENT_CREATED_QUEUE!,
  //   'client_events',
  //   (message) => handleClientCreatedUseCase.execute(message)
  // );

  const patientController = new PatientController(
    getPatientsByOwnerUseCase,
    createPatientUseCase,
    getPatientUseCase,
    getAllPatientsUseCase,
    updatePatientUseCase,
    deletePatientUseCase
  );

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api', createPatientRoutes(patientController));

  app.get('/health', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Patient service is running',
      timestamp: new Date().toISOString()
    });
  });

  app.listen(PORT, () => {
    console.log(` Patient service running on port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('\n Shutting down patient service gracefully...');
    // await eventConsumer.disconnect();
    process.exit(0);
  });
};

bootstrap().catch(console.error);