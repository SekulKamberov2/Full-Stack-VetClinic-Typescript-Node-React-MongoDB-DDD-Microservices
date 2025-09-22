import { Router } from 'express';
import { createServiceProxy } from './proxy';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'API Gateway healthy' }));
router.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

 
router.use('/auth', createServiceProxy(
  process.env.AUTH_SERVICE_URL || 'http://auth-service:3001', { '^/auth': '/api/auth' }, false ));
 
router.use(
  '/patients',
  authenticate,
  authorize('vet', 'admin', 'client'),
  createServiceProxy('http://patient-service:3003', {   
    '^/patients': '/api/patients' 
  }, true)
);

router.use(
  '/clients',
  authenticate,
  authorize('vet', 'admin', 'client'),
  createServiceProxy('http://client-service:3002', {   
    '^/clients': '/api/clients' 
  }, true)
);

//router.use('/clients', authenticate, createServiceProxy('http://client-service:3002', { '^/clients': '/' }));

//router.use('/patients', authenticate, authorize('vet', 'admin', 'client'), createServiceProxy('http://patient-service:3003', { '^/patients': '/api/patients' }, true));

router.use('/appointments', authenticate, createServiceProxy('http://appointment-service:3004', { '^/appointments': '/' }));

router.use('/billing', authenticate, authorize('admin'), createServiceProxy('http://billing-service:3005', { '^/billing': '/' }));

router.use('/medical-records', authenticate, authorize('vet', 'admin'), createServiceProxy('http://medical-record-service:3006', { '^/medical-records': '/' }));

export default router;
