import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './infrastructure/config/database';
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

dotenv.config();

const PORT = process.env.PORT || 3004;

const bootstrap = async () => {
  await connectDB(process.env.MONGODB_URI!);
 
  const appointmentRepository = new MongoAppointmentRepository();
 
  const eventPublisher = new EventPublisher(process.env.RABBITMQ_URL!);
  const eventConsumer = new EventConsumer(process.env.RABBITMQ_URL!);
  
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
 
  app.get('/health', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Appointment service is running',
      timestamp: new Date().toISOString()
    });
  });
 
  app.listen(PORT, () => {
    console.log(`Appointment service running on port ${PORT}`);
  });
 
  process.on('SIGINT', async () => {
    console.log('\nShutting down appointment service gracefully...');
    await eventPublisher.disconnect();
    await eventConsumer.disconnect();
    process.exit(0);
  });
};

bootstrap().catch(console.error);