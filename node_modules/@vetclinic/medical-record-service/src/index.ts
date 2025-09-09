import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

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

const bootstrap = async () => {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully');

  const eventPublisher = new RabbitMQEventPublisher(RABBITMQ_URI);
  await eventPublisher.connect();
  console.log('Event publisher connected successfully');

  const medicalRecordRepository = new MongoMedicalRecordRepository(eventPublisher);
  const prescriptionRepository = new MongoPrescriptionRepository();
  const diagnosisRepository = new MongoDiagnosisRepository();
  const treatmentRepository = new MongoTreatmentRepository();

  console.log('All repositories initialized');

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

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/medical-records', createMedicalRecordRoutes(medicalRecordController));
  app.use('/api/medical-records', createPrescriptionRoutes(prescriptionController));
  app.use('/api/medical-records', createDiagnosisRoutes(diagnosisController));
  app.use('/api/medical-records', createTreatmentRoutes(treatmentController));

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'medical-record-service',
      version: '1.0.0'
    });
  });

  app.use((error: Error, _req: Request, res: Response, _next: Function) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  });

  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`
    });
  });

  app.listen(PORT, () => {
    console.log(`Medical Record Service is running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`MongoDB connected to: ${MONGODB_URI}`);
    console.log(`RabbitMQ connected to: ${RABBITMQ_URI}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await eventPublisher.disconnect();
    await mongoose.connection.close();
    console.log('Shutdown completed successfully.');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM. Shutting down gracefully...');
    await eventPublisher.disconnect();
    await mongoose.connection.close();
    console.log('Shutdown completed successfully.');
    process.exit(0);
  });
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
  console.error('Fatal error during application startup:', error);
  process.exit(1);
});
