"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("../src/infrastructure/config/database");
const MongoAppointmentRepository_1 = require("./infrastructure/persistence/MongoAppointmentRepository");
const EventPublisher_1 = require("./infrastructure/messaging/EventPublisher");
const EventConsumer_1 = require("./infrastructure/messaging/EventConsumer");
const CreateAppointmentUseCase_1 = require("./application/use-cases/CreateAppointmentUseCase");
const GetAppointmentUseCase_1 = require("./application/use-cases/GetAppointmentUseCase");
const GetAppointmentsByVetUseCase_1 = require("./application/use-cases/GetAppointmentsByVetUseCase");
const GetAppointmentsByClientUseCase_1 = require("./application/use-cases/GetAppointmentsByClientUseCase");
const ConfirmAppointmentUseCase_1 = require("./application/use-cases/ConfirmAppointmentUseCase");
const CancelAppointmentUseCase_1 = require("./application/use-cases/CancelAppointmentUseCase");
const CompleteAppointmentUseCase_1 = require("./application/use-cases/CompleteAppointmentUseCase");
const StartAppointmentUseCase_1 = require("./application/use-cases/StartAppointmentUseCase");
const AppointmentController_1 = require("./interfaces/controllers/AppointmentController");
const appointmentRoutes_1 = require("./interfaces/routes/appointmentRoutes");
const PORT = process.env.PORT || 3004;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetclinic-appointments';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const bootstrap = async () => {
    try {
        console.log('Starting Appointment Service...');
        console.log('Connecting to MongoDB...');
        await database_1.database.connect({
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
        await database_1.database.createIndexes();
        console.log('Database indexes created successfully');
        const appointmentRepository = new MongoAppointmentRepository_1.MongoAppointmentRepository();
        const eventPublisher = new EventPublisher_1.EventPublisher(RABBITMQ_URL);
        const eventConsumer = new EventConsumer_1.EventConsumer(RABBITMQ_URL);
        await eventPublisher.connect();
        await eventConsumer.connect();
        const createAppointmentUseCase = new CreateAppointmentUseCase_1.CreateAppointmentUseCase(appointmentRepository, eventPublisher);
        const getAppointmentUseCase = new GetAppointmentUseCase_1.GetAppointmentUseCase(appointmentRepository);
        const getAppointmentsByVetUseCase = new GetAppointmentsByVetUseCase_1.GetAppointmentsByVetUseCase(appointmentRepository);
        const getAppointmentsByClientUseCase = new GetAppointmentsByClientUseCase_1.GetAppointmentsByClientUseCase(appointmentRepository);
        const confirmAppointmentUseCase = new ConfirmAppointmentUseCase_1.ConfirmAppointmentUseCase(appointmentRepository, eventPublisher);
        const cancelAppointmentUseCase = new CancelAppointmentUseCase_1.CancelAppointmentUseCase(appointmentRepository, eventPublisher);
        const completeAppointmentUseCase = new CompleteAppointmentUseCase_1.CompleteAppointmentUseCase(appointmentRepository, eventPublisher);
        const startAppointmentUseCase = new StartAppointmentUseCase_1.StartAppointmentUseCase(appointmentRepository, eventPublisher);
        const appointmentController = new AppointmentController_1.AppointmentController(createAppointmentUseCase, getAppointmentUseCase, getAppointmentsByVetUseCase, getAppointmentsByClientUseCase, confirmAppointmentUseCase, cancelAppointmentUseCase, completeAppointmentUseCase, startAppointmentUseCase);
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        app.use('/api', (0, appointmentRoutes_1.createAppointmentRoutes)(appointmentController));
        app.get('/health', async (req, res) => {
            try {
                const dbHealth = await database_1.database.healthCheck();
                res.json({
                    success: true,
                    message: 'Appointment service is running',
                    database: dbHealth ? 'connected' : 'disconnected',
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Health check failed',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        app.listen(PORT, () => {
            console.log(`Appointment service running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
        const gracefulShutdown = async (signal) => {
            console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
            try {
                await eventPublisher.disconnect();
                console.log('RabbitMQ publisher disconnected');
                await eventConsumer.disconnect();
                console.log('RabbitMQ consumer disconnected');
                await database_1.database.disconnect();
                console.log('MongoDB connection closed');
                console.log('Shutdown completed');
                process.exit(0);
            }
            catch (error) {
                console.error('Error during shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map