import express from 'express';
import cors from 'cors';
import { database } from './infrastructure/config/database';
import { MongoInvoiceRepository } from './infrastructure/persistence/MongoInvoiceRepository';
import { MongoPaymentRepository } from './infrastructure/persistence/MongoPaymentRepository';
import { MongoServiceRepository } from './infrastructure/persistence/MongoServiceRepository';
import { EventPublisher } from './infrastructure/messaging/EventPublisher';
import { CreateInvoiceUseCase } from './application/use-cases/CreateInvoiceUseCase';
import { GetInvoiceUseCase } from './application/use-cases/GetInvoiceUseCase';
import { GetClientInvoicesUseCase } from './application/use-cases/GetClientInvoicesUseCase';
import { GetAllInvoicesUseCase } from './application/use-cases/GetAllInvoicesUseCase';
import { ProcessPaymentUseCase } from './application/use-cases/ProcessPaymentUseCase';
import { CreateServiceUseCase } from './application/use-cases/CreateServiceUseCase';
import { RefundPaymentUseCase } from './application/use-cases/RefundPaymentUseCase';
import { InvoiceController } from './interfaces/controllers/InvoiceController';
import { PaymentController } from './interfaces/controllers/PaymentController';
import { ServiceController } from './interfaces/controllers/ServiceController';
import { createInvoiceRoutes } from './interfaces/routes/invoiceRoutes';
import { createPaymentRoutes } from './interfaces/routes/paymentRoutes';
import { createServiceRoutes } from './interfaces/routes/serviceRoutes';
import { GetServiceUseCase } from './application/use-cases/GetServiceUseCase';
import { GetAllServicesUseCase } from './application/use-cases/GetAllServicesUseCase';
import { GetServicesByCategoryUseCase } from './application/use-cases/GetServicesByCategoryUseCase';
import { UpdateServiceUseCase } from './application/use-cases/UpdateServiceUseCase';
import { DeleteServiceUseCase } from './application/use-cases/DeleteServiceUseCase';
import { GetServiceStatsUseCase } from './application/use-cases/GetServiceStatsUseCase';
import { FindServiceByNameUseCase } from './application/use-cases/FindServiceByNameUseCase';
import { FindServicesByPriceRangeUseCase } from './application/use-cases/FindServicesByPriceRangeUseCase';
import { FindAllActiveServicesUseCase } from './application/use-cases/FindAllActiveServicesUseCase';
import { ReactivateServiceUseCase } from './application/use-cases/ReactivateServiceUseCase';

const PORT = process.env.PORT || 3005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetclinic-billing';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

const bootstrap = async () => {
  try {
    console.log('Starting Billing Service...');
    
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

    const invoiceRepository = new MongoInvoiceRepository();
    const paymentRepository = new MongoPaymentRepository();
    const serviceRepository = new MongoServiceRepository();
    
    const eventPublisher = new EventPublisher(RABBITMQ_URL);
    
    await eventPublisher.connect();
    
    const createInvoiceUseCase = new CreateInvoiceUseCase(invoiceRepository);
    const getInvoiceUseCase = new GetInvoiceUseCase(invoiceRepository);
    const getClientInvoicesUseCase = new GetClientInvoicesUseCase(invoiceRepository);
    const getAllInvoicesUseCase = new GetAllInvoicesUseCase(invoiceRepository);
    
    const processPaymentUseCase = new ProcessPaymentUseCase(paymentRepository, invoiceRepository, eventPublisher);
    const refundPaymentUseCase = new RefundPaymentUseCase(paymentRepository, invoiceRepository, eventPublisher);
    
    const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
    const getServiceUseCase = new GetServiceUseCase(serviceRepository);
    const getAllServicesUseCase = new GetAllServicesUseCase(serviceRepository);
    const getServicesByCategoryUseCase = new GetServicesByCategoryUseCase(serviceRepository);
    const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
    const deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository);
    const getServiceStatsUseCase = new GetServiceStatsUseCase(serviceRepository);
    const findServiceByNameUseCase = new FindServiceByNameUseCase(serviceRepository);
    const findServicesByPriceRangeUseCase = new FindServicesByPriceRangeUseCase(serviceRepository);
    const findAllActiveServicesUseCase = new FindAllActiveServicesUseCase(serviceRepository);
    const reactivateServiceUseCase = new ReactivateServiceUseCase(serviceRepository);
    
    const invoiceController = new InvoiceController(
      createInvoiceUseCase,
      getInvoiceUseCase,
      getClientInvoicesUseCase,
      getAllInvoicesUseCase
    );
    
    const paymentController = new PaymentController(
      processPaymentUseCase,
      refundPaymentUseCase,
      paymentRepository
    );
    
    const serviceController = new ServiceController(
      createServiceUseCase,
      getServiceUseCase,
      getAllServicesUseCase,
      getServicesByCategoryUseCase,
      updateServiceUseCase,
      deleteServiceUseCase,
      getServiceStatsUseCase,
      findServiceByNameUseCase,
      findServicesByPriceRangeUseCase,
      findAllActiveServicesUseCase,
      reactivateServiceUseCase
    );
    
    const app = express();
    app.use(cors());
    app.use(express.json());
    
    app.use('/api', createInvoiceRoutes(invoiceController));
    app.use('/api', createPaymentRoutes(paymentController));
    app.use('/api', createServiceRoutes(serviceController));
    
    app.get('/health', async (_req, res) => {
      try {
        const dbHealth = await database.healthCheck();
        res.json({ 
          success: true, 
          message: 'Billing service is running',
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
      console.log(`Billing service running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
    
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
      
      try {
        await eventPublisher.disconnect();
        console.log('RabbitMQ publisher disconnected');
        
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
