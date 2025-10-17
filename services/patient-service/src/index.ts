import express from 'express';
import cors from 'cors';
import { database } from './infrastructure/config/database';

import { MongoPatientRepository } from './infrastructure/persistence/MongoPatientRepository';
import { MongoVisitRepository } from './infrastructure/persistence/MongoVisitRepository';
import { MongoAllergyRepository } from './infrastructure/persistence/MongoAllergyRepository';
import { MongoVaccinationRecordRepository } from './infrastructure/persistence/MongoVaccinationRecordRepository';
import { MongoMedicalAlertRepository } from './infrastructure/persistence/MongoMedicalAlertRepository';
import { MongoPatientNoteRepository } from './infrastructure/persistence/MongoPatientNoteRepository';

import { CreatePatientUseCase } from './application/use-cases/Patients/CreatePatientUseCase';
import { GetPatientUseCase } from './application/use-cases/Patients/GetPatientUseCase';
import { UpdatePatientUseCase } from './application/use-cases/Patients/UpdatePatientUseCase';
import { DeletePatientUseCase } from './application/use-cases/Patients/DeletePatientUseCase';
import { GetAllPatientsUseCase } from './application/use-cases/Patients/GetAllPatientsUseCase';
import { GetPatientsByOwnerUseCase } from './application/use-cases/Patients/GetPatientsByOwnerUseCase';
import { SearchPatientsUseCase } from './application/use-cases/Patients/SearchPatientsUseCase';
import { GetPatientStatsUseCase } from './application/use-cases/Patients/GetPatientStatsUseCase';
import { GetPatientWithDetailsByOwnerUseCase } from './application/use-cases/Patients/GetPatientWithDetailsByOwnerUseCase'; // NEW

import { CreateVisitUseCase } from './application/use-cases/Visits/CreateVisitUseCase';
import { GetVisitUseCase } from './application/use-cases/Visits/GetVisitUseCase';
import { UpdateVisitUseCase } from './application/use-cases/Visits/UpdateVisitUseCase';
import { DeleteVisitUseCase } from './application/use-cases/Visits/DeleteVisitUseCase';
import { GetAllVisitsUseCase } from './application/use-cases/Visits/GetAllVisitsUseCase';
import { GetVisitsByPatientUseCase } from './application/use-cases/Visits/GetVisitsByPatientUseCase';
import { GetUpcomingVisitsUseCase } from './application/use-cases/Visits/GetUpcomingVisitsUseCase';
import { CheckInVisitUseCase } from './application/use-cases/Visits/CheckInVisitUseCase';
import { CompleteVisitUseCase } from './application/use-cases/Visits/CompleteVisitUseCase';
import { CancelVisitUseCase } from './application/use-cases/Visits/CancelVisitUseCase';
import { GetVisitStatsUseCase } from './application/use-cases/Visits/GetVisitStatsUseCase';

import { CreateAllergyUseCase } from './application/use-cases/Allergies/CreateAllergyUseCase';
import { GetAllergyUseCase } from './application/use-cases/Allergies/GetAllergyUseCase';
import { UpdateAllergyUseCase } from './application/use-cases/Allergies/UpdateAllergyUseCase';
import { DeleteAllergyUseCase } from './application/use-cases/Allergies/DeleteAllergyUseCase';
import { GetAllAllergiesUseCase } from './application/use-cases/Allergies/GetAllAllergiesUseCase';
import { GetAllergiesByPatientUseCase } from './application/use-cases/Allergies/GetAllergiesByPatientUseCase';
import { GetActiveAllergiesByPatientUseCase } from './application/use-cases/Allergies/GetActiveAllergiesByPatientUseCase';

import { CreateVaccinationUseCase } from './application/use-cases/Vaccinations/CreateVaccinationUseCase';
import { GetVaccinationUseCase } from './application/use-cases/Vaccinations/GetVaccinationUseCase';
import { UpdateVaccinationUseCase } from './application/use-cases/Vaccinations/UpdateVaccinationUseCase';
import { DeleteVaccinationUseCase } from './application/use-cases/Vaccinations/DeleteVaccinationUseCase';
import { GetAllVaccinationsUseCase } from './application/use-cases/Vaccinations/GetAllVaccinationsUseCase';
import { GetVaccinationsByPatientUseCase } from './application/use-cases/Vaccinations/GetVaccinationsByPatientUseCase';
import { GetDueVaccinationsUseCase } from './application/use-cases/Vaccinations/GetDueVaccinationsUseCase';
import { GetOverdueVaccinationsUseCase } from './application/use-cases/Vaccinations/GetOverdueVaccinationsUseCase';
import { GetVaccinationStatsUseCase } from './application/use-cases/Vaccinations/GetVaccinationStatsUseCase';

import { CreateMedicalAlertUseCase } from './application/use-cases/MedicalAlerts/CreateMedicalAlertUseCase';
import { GetMedicalAlertUseCase } from './application/use-cases/MedicalAlerts/GetMedicalAlertUseCase';
import { UpdateMedicalAlertUseCase } from './application/use-cases/MedicalAlerts/UpdateMedicalAlertUseCase';
import { DeleteMedicalAlertUseCase } from './application/use-cases/MedicalAlerts/DeleteMedicalAlertUseCase';
import { GetAllMedicalAlertsUseCase } from './application/use-cases/MedicalAlerts/GetAllMedicalAlertsUseCase';
import { GetMedicalAlertsByPatientUseCase } from './application/use-cases/MedicalAlerts/GetMedicalAlertsByPatientUseCase';
import { GetActiveMedicalAlertsByPatientUseCase } from './application/use-cases/MedicalAlerts/GetActiveMedicalAlertsByPatientUseCase';
import { GetCriticalAlertsUseCase } from './application/use-cases/MedicalAlerts/GetCriticalAlertsUseCase';

import { CreatePatientNoteUseCase } from './application/use-cases/PatientNotes/CreatePatientNoteUseCase';
import { GetPatientNoteUseCase } from './application/use-cases/PatientNotes/GetPatientNoteUseCase';
import { UpdatePatientNoteUseCase } from './application/use-cases/PatientNotes/UpdatePatientNoteUseCase';
import { DeletePatientNoteUseCase } from './application/use-cases/PatientNotes/DeletePatientNoteUseCase';
import { GetAllPatientNotesUseCase } from './application/use-cases/PatientNotes/GetAllPatientNotesUseCase';
import { GetPatientNotesByPatientUseCase } from './application/use-cases/PatientNotes/GetPatientNotesByPatientUseCase';
import { GetRecentPatientNotesUseCase } from './application/use-cases/PatientNotes/GetRecentPatientNotesUseCase';
 
import { PatientController } from './interfaces/controllers/PatientController'; 
import { VisitController } from './interfaces/controllers/VisitController';
import { AllergyController } from './interfaces/controllers/AllergyController';
import { VaccinationController } from './interfaces/controllers/VaccinationController';
import { MedicalAlertController } from './interfaces/controllers/MedicalAlertController';
import { PatientNoteController } from './interfaces/controllers/PatientNoteController';

import { EventHandlers } from './infrastructure/messaging/EventHandlers';
import { EventConsumer } from './infrastructure/messaging/EventConsumer';

import { createPatientRoutes } from './interfaces/routes/patientRoutes';

const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetclinic-patients';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

const bootstrap = async () => {
  try {
    console.log('Starting Patient Service...');
    
    await database.connect({
      uri: MONGODB_URI,
      options: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
      }
    });

    const patientRepository = new MongoPatientRepository(); 
    const visitRepository = new MongoVisitRepository();
    const allergyRepository = new MongoAllergyRepository();
    const vaccinationRepository = new MongoVaccinationRecordRepository();
    const medicalAlertRepository = new MongoMedicalAlertRepository();
    const patientNoteRepository = new MongoPatientNoteRepository();

    const createPatientUseCase = new CreatePatientUseCase(patientRepository);
    const getPatientUseCase = new GetPatientUseCase(patientRepository);
    const updatePatientUseCase = new UpdatePatientUseCase(patientRepository);
    const deletePatientUseCase = new DeletePatientUseCase(patientRepository);
    const getAllPatientsUseCase = new GetAllPatientsUseCase(patientRepository);
    const getPatientsByOwnerUseCase = new GetPatientsByOwnerUseCase(patientRepository);
    const searchPatientsUseCase = new SearchPatientsUseCase(patientRepository);
    const getPatientStatsUseCase = new GetPatientStatsUseCase(patientRepository); 
    
    const getPatientWithDetailsByOwnerUseCase = new GetPatientWithDetailsByOwnerUseCase(
      patientRepository,
      allergyRepository,
      medicalAlertRepository,
      patientNoteRepository,
      vaccinationRepository,
      visitRepository
    );

    const createVisitUseCase = new CreateVisitUseCase(visitRepository);
    const getVisitUseCase = new GetVisitUseCase(visitRepository);
    const updateVisitUseCase = new UpdateVisitUseCase(visitRepository);
    const deleteVisitUseCase = new DeleteVisitUseCase(visitRepository);
    const getAllVisitsUseCase = new GetAllVisitsUseCase(visitRepository);
    const getVisitsByPatientUseCase = new GetVisitsByPatientUseCase(visitRepository);
    const getUpcomingVisitsUseCase = new GetUpcomingVisitsUseCase(visitRepository);
    const checkInVisitUseCase = new CheckInVisitUseCase(visitRepository);
    const completeVisitUseCase = new CompleteVisitUseCase(visitRepository);
    const cancelVisitUseCase = new CancelVisitUseCase(visitRepository);
    const getVisitStatsUseCase = new GetVisitStatsUseCase(visitRepository);

    const createAllergyUseCase = new CreateAllergyUseCase(allergyRepository);
    const getAllergyUseCase = new GetAllergyUseCase(allergyRepository);
    const updateAllergyUseCase = new UpdateAllergyUseCase(allergyRepository);
    const deleteAllergyUseCase = new DeleteAllergyUseCase(allergyRepository);
    const getAllAllergiesUseCase = new GetAllAllergiesUseCase(allergyRepository);
    const getAllergiesByPatientUseCase = new GetAllergiesByPatientUseCase(allergyRepository);
    const getActiveAllergiesByPatientUseCase = new GetActiveAllergiesByPatientUseCase(allergyRepository);

    const createVaccinationUseCase = new CreateVaccinationUseCase(vaccinationRepository);
    const getVaccinationUseCase = new GetVaccinationUseCase(vaccinationRepository);
    const updateVaccinationUseCase = new UpdateVaccinationUseCase(vaccinationRepository);
    const deleteVaccinationUseCase = new DeleteVaccinationUseCase(vaccinationRepository);
    const getAllVaccinationsUseCase = new GetAllVaccinationsUseCase(vaccinationRepository);
    const getVaccinationsByPatientUseCase = new GetVaccinationsByPatientUseCase(vaccinationRepository);
    const getDueVaccinationsUseCase = new GetDueVaccinationsUseCase(vaccinationRepository);
    const getOverdueVaccinationsUseCase = new GetOverdueVaccinationsUseCase(vaccinationRepository);
    const getVaccinationStatsUseCase = new GetVaccinationStatsUseCase(vaccinationRepository);

    const createMedicalAlertUseCase = new CreateMedicalAlertUseCase(medicalAlertRepository);
    const getMedicalAlertUseCase = new GetMedicalAlertUseCase(medicalAlertRepository);
    const updateMedicalAlertUseCase = new UpdateMedicalAlertUseCase(medicalAlertRepository);
    const deleteMedicalAlertUseCase = new DeleteMedicalAlertUseCase(medicalAlertRepository);
    const getAllMedicalAlertsUseCase = new GetAllMedicalAlertsUseCase(medicalAlertRepository);
    const getMedicalAlertsByPatientUseCase = new GetMedicalAlertsByPatientUseCase(medicalAlertRepository);
    const getActiveMedicalAlertsByPatientUseCase = new GetActiveMedicalAlertsByPatientUseCase(medicalAlertRepository);
    const getCriticalAlertsUseCase = new GetCriticalAlertsUseCase(medicalAlertRepository);

    const createPatientNoteUseCase = new CreatePatientNoteUseCase(patientNoteRepository);
    const getPatientNoteUseCase = new GetPatientNoteUseCase(patientNoteRepository);
    const updatePatientNoteUseCase = new UpdatePatientNoteUseCase(patientNoteRepository);
    const deletePatientNoteUseCase = new DeletePatientNoteUseCase(patientNoteRepository);
    const getAllPatientNotesUseCase = new GetAllPatientNotesUseCase(patientNoteRepository);
    const getPatientNotesByPatientUseCase = new GetPatientNotesByPatientUseCase(patientNoteRepository);
    const getRecentPatientNotesUseCase = new GetRecentPatientNotesUseCase(patientNoteRepository);

    const patientController = new PatientController(
      createPatientUseCase,
      getPatientUseCase,
      updatePatientUseCase,
      deletePatientUseCase,
      getAllPatientsUseCase,
      getPatientsByOwnerUseCase,
      searchPatientsUseCase,
      getPatientStatsUseCase,
      getPatientWithDetailsByOwnerUseCase
    ); 

    const visitController = new VisitController(
      createVisitUseCase,
      getVisitUseCase,
      updateVisitUseCase,
      deleteVisitUseCase,
      getAllVisitsUseCase,
      getVisitsByPatientUseCase,
      getUpcomingVisitsUseCase,
      checkInVisitUseCase,
      completeVisitUseCase,
      cancelVisitUseCase,
      getVisitStatsUseCase
    );

    const allergyController = new AllergyController(
      createAllergyUseCase,
      getAllergyUseCase,
      updateAllergyUseCase,
      deleteAllergyUseCase,
      getAllAllergiesUseCase,
      getAllergiesByPatientUseCase,
      getActiveAllergiesByPatientUseCase
    );

    const vaccinationController = new VaccinationController(
      createVaccinationUseCase,
      getVaccinationUseCase,
      updateVaccinationUseCase,
      deleteVaccinationUseCase,
      getAllVaccinationsUseCase,
      getVaccinationsByPatientUseCase,
      getDueVaccinationsUseCase,
      getOverdueVaccinationsUseCase,
      getVaccinationStatsUseCase
    );

    const medicalAlertController = new MedicalAlertController(
      createMedicalAlertUseCase,
      getMedicalAlertUseCase,
      updateMedicalAlertUseCase,
      deleteMedicalAlertUseCase,
      getAllMedicalAlertsUseCase,
      getMedicalAlertsByPatientUseCase,
      getActiveMedicalAlertsByPatientUseCase,
      getCriticalAlertsUseCase
    );

    const patientNoteController = new PatientNoteController(
      createPatientNoteUseCase,
      getPatientNoteUseCase,
      updatePatientNoteUseCase,
      deletePatientNoteUseCase,
      getAllPatientNotesUseCase,
      getPatientNotesByPatientUseCase,
      getRecentPatientNotesUseCase
    );

    const eventHandlers = new EventHandlers(
      updateVisitUseCase,
      updateAllergyUseCase,
      updateVaccinationUseCase,
      updatePatientNoteUseCase
    );
    
    const eventConsumer = new EventConsumer(RABBITMQ_URL, eventHandlers);
    await eventConsumer.connect();
    await eventConsumer.startConsuming();

    const app = express();
    app.use(cors({
      origin: 'http://localhost:3007',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }));
    app.use(express.json());
    
    app.use('/api', createPatientRoutes(
      patientController,
      visitController,
      allergyController,
      vaccinationController,
      medicalAlertController,
      patientNoteController
    ));
    
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
      console.log(`API endpoints available at: http://localhost:${PORT}/api`);
      console.log(`Patient details endpoint: GET http://localhost:${PORT}/api/owners/:ownerId/patients/:patientId/details`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      await eventConsumer.disconnect();
      await database.disconnect();
      console.log('Patient service shutdown completed');
      process.exit(0);
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
