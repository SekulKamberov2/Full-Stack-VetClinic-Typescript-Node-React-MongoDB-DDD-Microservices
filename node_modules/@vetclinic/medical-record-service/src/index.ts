import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';

import { database } from './infrastructure/config/database';

import { createMedicalRecordRoutes } from './interfaces/routes/medicalRecordRoutes';
import { createPrescriptionRoutes } from './interfaces/routes/prescriptionRoutes';
import { createDiagnosisRoutes } from './interfaces/routes/diagnosisRoutes';
import { createTreatmentRoutes } from './interfaces/routes/treatmentRoutes';

import { RabbitMQEventPublisher } from './infrastructure/messaging/RabbitMQEventPublisher';

import { MongoMedicalRecordRepository } from './infrastructure/persistence/MongoMedicalRecordRepository';
import { MongoPrescriptionRepository } from './infrastructure/persistence/MongoPrescriptionRepository';
import { MongoDiagnosisRepository } from './infrastructure/persistence/MongoDiagnosisRepository';
import { MongoTreatmentRepository } from './infrastructure/persistence/MongoTreatmentRepository';

import { CreateMedicalRecordUseCase } from './application/use-cases/CreateMedicalRecordUseCase';
import { GetMedicalRecordByIdUseCase } from './application/use-cases/GetMedicalRecordByIdUseCase';
import { GetMedicalRecordsByPatientUseCase } from './application/use-cases/GetMedicalRecordByPatientUseCase';
import { GetMedicalRecordsByClientUseCase } from './application/use-cases/GetMedicalRecordsByClientUseCase';
import { GetMedicalRecordsByVeterinarianUseCase } from './application/use-cases/GetMedicalRecordsByVeterinarianUseCase';
import { GetAllMedicalRecordsUseCase } from './application/use-cases/GetAllMedicalRecordsUseCase';
import { UpdateMedicalRecordUseCase } from './application/use-cases/UpdateMedicalRecordUseCase';
import { DeleteMedicalRecordUseCase } from './application/use-cases/DeleteMedicalRecordUseCase';

import { GetPrescriptionsByRecordUseCase } from './application/use-cases/GetPrescriptionsByRecordUseCase';
import { GetPrescriptionByIdUseCase } from './application/use-cases/GetPrescriptionByIdUseCase';
import { UpdatePrescriptionUseCase } from './application/use-cases/UpdatePrescriptionUseCase';
import { DeletePrescriptionUseCase } from './application/use-cases/DeletePrescriptionUseCase';
import { MarkPrescriptionFilledUseCase } from './application/use-cases/MarkPrescriptionFilledUseCase';

import { GetDiagnosesByRecordUseCase } from './application/use-cases/GetDiagnosesByRecordUseCase';
import { GetDiagnosisByIdUseCase } from './application/use-cases/GetDiagnosisByIdUseCase';

import { GetTreatmentsByRecordUseCase } from './application/use-cases/GetTreatmentsByRecordUseCase';
import { GetTreatmentByIdUseCase } from './application/use-cases/GetTreatmentByIdUseCase';

import { MedicalRecordController } from './interfaces/controllers/MedicalRecordController';
import { PrescriptionController } from './interfaces/controllers/PrescriptionController';
import { DiagnosisController } from './interfaces/controllers/DiagnosisController';
import { TreatmentController } from './interfaces/controllers/TreatmentController';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-record-service';
const RABBITMQ_URI = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const NODE_ENV = process.env.NODE_ENV || 'development';

const bootstrap = async () => {
  try {
    console.log('Starting Medical Record Service...');
    console.log(`Environment: ${NODE_ENV}`);
    
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

    console.log('Connecting to RabbitMQ...');
    const eventPublisher = new RabbitMQEventPublisher(RABBITMQ_URI);
    await eventPublisher.connect();
    console.log('Event publisher connected successfully');

    console.log('Initializing repositories...');
    const medicalRecordRepository = new MongoMedicalRecordRepository(eventPublisher);
    const prescriptionRepository = new MongoPrescriptionRepository();
    const diagnosisRepository = new MongoDiagnosisRepository();
    const treatmentRepository = new MongoTreatmentRepository();
    console.log('All repositories initialized');

    console.log('Initializing use cases...');
    const createMedicalRecordUseCase = new CreateMedicalRecordUseCase(medicalRecordRepository);
    const getMedicalRecordByIdUseCase = new GetMedicalRecordByIdUseCase(medicalRecordRepository);
    const getRecordsByPatientUseCase = new GetMedicalRecordsByPatientUseCase(medicalRecordRepository);
    const getRecordsByClientUseCase = new GetMedicalRecordsByClientUseCase(medicalRecordRepository);
    const getRecordsByVeterinarianUseCase = new GetMedicalRecordsByVeterinarianUseCase(medicalRecordRepository);
    const getAllMedicalRecordsUseCase = new GetAllMedicalRecordsUseCase(medicalRecordRepository);
    const updateMedicalRecordUseCase = new UpdateMedicalRecordUseCase(medicalRecordRepository);
    const deleteMedicalRecordUseCase = new DeleteMedicalRecordUseCase(medicalRecordRepository);

    const getPrescriptionsByRecordUseCase = new GetPrescriptionsByRecordUseCase(prescriptionRepository);
    const getPrescriptionByIdUseCase = new GetPrescriptionByIdUseCase(prescriptionRepository);
    const updatePrescriptionUseCase = new UpdatePrescriptionUseCase(prescriptionRepository);
    const deletePrescriptionUseCase = new DeletePrescriptionUseCase(prescriptionRepository);
    const markPrescriptionFilledUseCase = new MarkPrescriptionFilledUseCase(prescriptionRepository);

    const getDiagnosesByRecordUseCase = new GetDiagnosesByRecordUseCase(diagnosisRepository);
    const getDiagnosisByIdUseCase = new GetDiagnosisByIdUseCase(diagnosisRepository);

    const getTreatmentsByRecordUseCase = new GetTreatmentsByRecordUseCase(treatmentRepository);
    const getTreatmentByIdUseCase = new GetTreatmentByIdUseCase(treatmentRepository);
    console.log('All use cases initialized');

    console.log('Initializing controllers...');
    const medicalRecordController = new MedicalRecordController(
      createMedicalRecordUseCase,
      getMedicalRecordByIdUseCase,
      getRecordsByPatientUseCase,
      getRecordsByClientUseCase,
      getRecordsByVeterinarianUseCase,
      getAllMedicalRecordsUseCase,
      updateMedicalRecordUseCase,
      deleteMedicalRecordUseCase
    );

    const prescriptionController = new PrescriptionController(
      medicalRecordRepository,
      prescriptionRepository,
      getPrescriptionsByRecordUseCase,
      getPrescriptionByIdUseCase,
      updatePrescriptionUseCase,
      deletePrescriptionUseCase,
      markPrescriptionFilledUseCase
    );

    const diagnosisController = new DiagnosisController(
      getDiagnosesByRecordUseCase,
      getDiagnosisByIdUseCase
    );

    const treatmentController = new TreatmentController(
      getTreatmentsByRecordUseCase,
      getTreatmentByIdUseCase
    );
    console.log('All controllers initialized');

    console.log('Initializing Express application...');
    const app = express();

    app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use((req: Request, _res: Response, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    app.use('/api/medical-records', createMedicalRecordRoutes(medicalRecordController));
    app.use('/api/medical-records', createPrescriptionRoutes(prescriptionController));
    app.use('/api/medical-records', createDiagnosisRoutes(diagnosisController));
    app.use('/api/medical-records', createTreatmentRoutes(treatmentController));

    app.get('/health', async (_req: Request, res: Response) => {
      try {
        const dbHealth = await database.healthCheck();
        const timestamp = new Date().toISOString();
        
        res.status(200).json({
          status: 'OK',
          timestamp,
          service: 'medical-record-service',
          version: '1.0.0',
          database: dbHealth ? 'connected' : 'disconnected',
          environment: NODE_ENV,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        });
      } catch (error) {
        res.status(500).json({
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          service: 'medical-record-service',
          database: 'error',
          error: 'Health check failed'
        });
      }
    });

    app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        message: 'Medical Record Service API',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/health'
      });
    });

    app.use((error: Error, _req: Request, res: Response, _next: Function) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });

    app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });

    const server = app.listen(PORT, () => {
      console.log('\n Medical Record Service Started Successfully');
      console.log('==============================================');
      console.log(`Server running on port: ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`MongoDB: ${MONGODB_URI}`);
      console.log(`RabbitMQ: ${RABBITMQ_URI}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log('==============================================\n');
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('Error closing server:', err);
          process.exit(1);
        }
        
        try {
          console.log('Closing connections...');
          
          await eventPublisher.disconnect();
          console.log('RabbitMQ connection closed');
          
          await database.disconnect();
          console.log('Database connection closed');
          
          console.log('All connections closed successfully');
          console.log('Shutdown completed');
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
