"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const medicalRecordRoutes_1 = require("./interfaces/routes/medicalRecordRoutes");
const prescriptionRoutes_1 = require("./interfaces/routes/prescriptionRoutes");
const diagnosisRoutes_1 = require("./interfaces/routes/diagnosisRoutes");
const treatmentRoutes_1 = require("./interfaces/routes/treatmentRoutes");
const RabbitMQEventPublisher_1 = require("./infrastructure/messaging/RabbitMQEventPublisher");
const MongoMedicalRecordRepository_1 = require("./infrastructure/persistence/MongoMedicalRecordRepository");
const MongoPrescriptionRepository_1 = require("./infrastructure/persistence/MongoPrescriptionRepository");
const MongoDiagnosisRepository_1 = require("./infrastructure/persistence/MongoDiagnosisRepository");
const MongoTreatmentRepository_1 = require("./infrastructure/persistence/MongoTreatmentRepository");
const CreateMedicalRecordUseCase_1 = require("./application/use-cases/CreateMedicalRecordUseCase");
const GetMedicalRecordByIdUseCase_1 = require("./application/use-cases/GetMedicalRecordByIdUseCase");
const GetMedicalRecordByPatientUseCase_1 = require("./application/use-cases/GetMedicalRecordByPatientUseCase");
const GetMedicalRecordsByClientUseCase_1 = require("./application/use-cases/GetMedicalRecordsByClientUseCase");
const GetMedicalRecordsByVeterinarianUseCase_1 = require("./application/use-cases/GetMedicalRecordsByVeterinarianUseCase");
const GetAllMedicalRecordsUseCase_1 = require("./application/use-cases/GetAllMedicalRecordsUseCase");
const UpdateMedicalRecordUseCase_1 = require("./application/use-cases/UpdateMedicalRecordUseCase");
const DeleteMedicalRecordUseCase_1 = require("./application/use-cases/DeleteMedicalRecordUseCase");
const GetPrescriptionsByRecordUseCase_1 = require("./application/use-cases/GetPrescriptionsByRecordUseCase");
const GetPrescriptionByIdUseCase_1 = require("./application/use-cases/GetPrescriptionByIdUseCase");
const UpdatePrescriptionUseCase_1 = require("./application/use-cases/UpdatePrescriptionUseCase");
const DeletePrescriptionUseCase_1 = require("./application/use-cases/DeletePrescriptionUseCase");
const MarkPrescriptionFilledUseCase_1 = require("./application/use-cases/MarkPrescriptionFilledUseCase");
const GetDiagnosesByRecordUseCase_1 = require("./application/use-cases/GetDiagnosesByRecordUseCase");
const GetDiagnosisByIdUseCase_1 = require("./application/use-cases/GetDiagnosisByIdUseCase");
const GetTreatmentsByRecordUseCase_1 = require("./application/use-cases/GetTreatmentsByRecordUseCase");
const GetTreatmentByIdUseCase_1 = require("./application/use-cases/GetTreatmentByIdUseCase");
const MedicalRecordController_1 = require("./interfaces/controllers/MedicalRecordController");
const PrescriptionController_1 = require("./interfaces/controllers/PrescriptionController");
const DiagnosisController_1 = require("./interfaces/controllers/DiagnosisController");
const TreatmentController_1 = require("./interfaces/controllers/TreatmentController");
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-record-service';
const RABBITMQ_URI = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const bootstrap = async () => {
    console.log('Connecting to MongoDB...');
    await mongoose_1.default.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    const eventPublisher = new RabbitMQEventPublisher_1.RabbitMQEventPublisher(RABBITMQ_URI);
    await eventPublisher.connect();
    console.log('Event publisher connected successfully');
    const medicalRecordRepository = new MongoMedicalRecordRepository_1.MongoMedicalRecordRepository(eventPublisher);
    const prescriptionRepository = new MongoPrescriptionRepository_1.MongoPrescriptionRepository();
    const diagnosisRepository = new MongoDiagnosisRepository_1.MongoDiagnosisRepository();
    const treatmentRepository = new MongoTreatmentRepository_1.MongoTreatmentRepository();
    console.log('All repositories initialized');
    const createMedicalRecordUseCase = new CreateMedicalRecordUseCase_1.CreateMedicalRecordUseCase(medicalRecordRepository);
    const getMedicalRecordByIdUseCase = new GetMedicalRecordByIdUseCase_1.GetMedicalRecordByIdUseCase(medicalRecordRepository);
    const getRecordsByPatientUseCase = new GetMedicalRecordByPatientUseCase_1.GetMedicalRecordsByPatientUseCase(medicalRecordRepository);
    const getRecordsByClientUseCase = new GetMedicalRecordsByClientUseCase_1.GetMedicalRecordsByClientUseCase(medicalRecordRepository);
    const getRecordsByVeterinarianUseCase = new GetMedicalRecordsByVeterinarianUseCase_1.GetMedicalRecordsByVeterinarianUseCase(medicalRecordRepository);
    const getAllMedicalRecordsUseCase = new GetAllMedicalRecordsUseCase_1.GetAllMedicalRecordsUseCase(medicalRecordRepository);
    const updateMedicalRecordUseCase = new UpdateMedicalRecordUseCase_1.UpdateMedicalRecordUseCase(medicalRecordRepository);
    const deleteMedicalRecordUseCase = new DeleteMedicalRecordUseCase_1.DeleteMedicalRecordUseCase(medicalRecordRepository);
    const getPrescriptionsByRecordUseCase = new GetPrescriptionsByRecordUseCase_1.GetPrescriptionsByRecordUseCase(prescriptionRepository);
    const getPrescriptionByIdUseCase = new GetPrescriptionByIdUseCase_1.GetPrescriptionByIdUseCase(prescriptionRepository);
    const updatePrescriptionUseCase = new UpdatePrescriptionUseCase_1.UpdatePrescriptionUseCase(prescriptionRepository);
    const deletePrescriptionUseCase = new DeletePrescriptionUseCase_1.DeletePrescriptionUseCase(prescriptionRepository);
    const markPrescriptionFilledUseCase = new MarkPrescriptionFilledUseCase_1.MarkPrescriptionFilledUseCase(prescriptionRepository);
    const getDiagnosesByRecordUseCase = new GetDiagnosesByRecordUseCase_1.GetDiagnosesByRecordUseCase(diagnosisRepository);
    const getDiagnosisByIdUseCase = new GetDiagnosisByIdUseCase_1.GetDiagnosisByIdUseCase(diagnosisRepository);
    const getTreatmentsByRecordUseCase = new GetTreatmentsByRecordUseCase_1.GetTreatmentsByRecordUseCase(treatmentRepository);
    const getTreatmentByIdUseCase = new GetTreatmentByIdUseCase_1.GetTreatmentByIdUseCase(treatmentRepository);
    console.log('All use cases initialized');
    const medicalRecordController = new MedicalRecordController_1.MedicalRecordController(createMedicalRecordUseCase, getMedicalRecordByIdUseCase, getRecordsByPatientUseCase, getRecordsByClientUseCase, getRecordsByVeterinarianUseCase, getAllMedicalRecordsUseCase, updateMedicalRecordUseCase, deleteMedicalRecordUseCase);
    const prescriptionController = new PrescriptionController_1.PrescriptionController(medicalRecordRepository, prescriptionRepository, getPrescriptionsByRecordUseCase, getPrescriptionByIdUseCase, updatePrescriptionUseCase, deletePrescriptionUseCase, markPrescriptionFilledUseCase);
    const diagnosisController = new DiagnosisController_1.DiagnosisController(getDiagnosesByRecordUseCase, getDiagnosisByIdUseCase);
    const treatmentController = new TreatmentController_1.TreatmentController(getTreatmentsByRecordUseCase, getTreatmentByIdUseCase);
    console.log('All controllers initialized');
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use('/api/medical-records', (0, medicalRecordRoutes_1.createMedicalRecordRoutes)(medicalRecordController));
    app.use('/api/medical-records', (0, prescriptionRoutes_1.createPrescriptionRoutes)(prescriptionController));
    app.use('/api/medical-records', (0, diagnosisRoutes_1.createDiagnosisRoutes)(diagnosisController));
    app.use('/api/medical-records', (0, treatmentRoutes_1.createTreatmentRoutes)(treatmentController));
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'medical-record-service',
            version: '1.0.0'
        });
    });
    app.use((error, _req, res, _next) => {
        console.error('Unhandled error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    });
    app.use('*', (req, res) => {
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
        await mongoose_1.default.connection.close();
        console.log('Shutdown completed successfully.');
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.log('\nReceived SIGTERM. Shutting down gracefully...');
        await eventPublisher.disconnect();
        await mongoose_1.default.connection.close();
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
//# sourceMappingURL=index.js.map