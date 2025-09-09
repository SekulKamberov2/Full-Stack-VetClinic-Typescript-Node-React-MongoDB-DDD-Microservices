import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './infrastructure/config/database';
import { MongoInvoiceRepository } from './infrastructure/persistence/MongoInvoiceRepository';
import { MongoPaymentRepository } from './infrastructure/persistence/MongoPaymentRepository';
 import { MongoServiceRepository } from './infrastructure/persistence/MongoServiceRepository';
import { RabbitMQEventPublisher } from './infrastructure/messaging/EventPublisher';
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

dotenv.config();

const PORT = process.env.PORT || 3005;

const bootstrap = async () => {
  await connectDB(process.env.MONGODB_URI!);

  const invoiceRepository = new MongoInvoiceRepository();
  const paymentRepository = new MongoPaymentRepository(); 
  const serviceRepository = new MongoServiceRepository();

  const eventPublisher = new RabbitMQEventPublisher(process.env.RABBITMQ_URL!);
  await eventPublisher.connect();
 
  const createInvoiceUseCase = new CreateInvoiceUseCase(invoiceRepository);
  const getInvoiceUseCase = new GetInvoiceUseCase(invoiceRepository);
  const getClientInvoicesUseCase = new GetClientInvoicesUseCase(invoiceRepository);
  const getAllInvoicesUseCase = new GetAllInvoicesUseCase(invoiceRepository);
  
  const processPaymentUseCase = new ProcessPaymentUseCase(paymentRepository, invoiceRepository, eventPublisher);
   const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
  const refundPaymentUseCase = new RefundPaymentUseCase(paymentRepository, invoiceRepository, eventPublisher);

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

  app.get('/health', (_req, res) => {
    res.json({ 
      success: true, 
      message: 'Billing service is running',
      timestamp: new Date().toISOString()
    });
  });

  app.listen(PORT, () => {
    console.log(`Billing service running on port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('\n Shutting down ...');
    await eventPublisher.disconnect();
    process.exit(0);
  });
};

bootstrap().catch(console.error);