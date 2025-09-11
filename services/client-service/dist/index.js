"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./infrastructure/config/database");
const MongoClientRepository_1 = require("./infrastructure/persistence/MongoClientRepository");
const CreateClientUseCase_1 = require("./application/use-cases/CreateClientUseCase");
const GetClientUseCase_1 = require("./application/use-cases/GetClientUseCase");
const GetAllClientsUseCase_1 = require("./application/use-cases/GetAllClientsUseCase");
const UpdateClientUseCase_1 = require("./application/use-cases/UpdateClientUseCase");
const DeleteClientUseCase_1 = require("./application/use-cases/DeleteClientUseCase");
const ClientController_1 = require("./interfaces/controllers/ClientController");
const clientRoutes_1 = require("./interfaces/routes/clientRoutes");
dotenv_1.default.config();
const PORT = process.env.PORT || 3002;
const bootstrap = async () => {
    await (0, database_1.connectDB)(process.env.MONGODB_URI);
    // Initialize RabbitMQ 
    // const eventPublisher = new EventPublisher(process.env.RABBITMQ_URL!);
    // await eventPublisher.connect();
    const clientRepository = new MongoClientRepository_1.MongoClientRepository();
    const createClientUseCase = new CreateClientUseCase_1.CreateClientUseCase(clientRepository, {});
    const getClientUseCase = new GetClientUseCase_1.GetClientUseCase(clientRepository);
    const getAllClientsUseCase = new GetAllClientsUseCase_1.GetAllClientsUseCase(clientRepository);
    const updateClientUseCase = new UpdateClientUseCase_1.UpdateClientUseCase(clientRepository);
    const deleteClientUseCase = new DeleteClientUseCase_1.DeleteClientUseCase(clientRepository);
    const clientController = new ClientController_1.ClientController(createClientUseCase, getClientUseCase, getAllClientsUseCase, updateClientUseCase, deleteClientUseCase);
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use('/api', (0, clientRoutes_1.createClientRoutes)(clientController));
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
