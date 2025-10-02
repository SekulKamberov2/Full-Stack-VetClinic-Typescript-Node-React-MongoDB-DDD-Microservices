import express from 'express';
import { ClientController } from '../controllers/ClientController';
import { authenticateToken, requireClient } from '../middleware/auth.middleware';

export const createClientRoutes = (clientController: ClientController) => {
  const router = express.Router();
 
router.use((req, _res, next) => {
  console.log('CLIENT-SERVICE REQUEST INCOMING:');
  console.log('   Method:', req.method);
  console.log('   URL:', req.url);
  console.log('   Path:', req.path);
  console.log('   Original URL:', req.originalUrl);
  console.log('   Headers:', {
    authorization: req.headers.authorization,
    'content-type': req.headers['content-type'],
    'x-user-id': req.headers['x-user-id'],
    cookie: req.headers.cookie
  });
  next();
});
  router.post('/clients', (req, res) => clientController.createClient(req, res));
  router.get('/clients/:id', (req, res) => clientController.getClient(req, res));
  router.get('/clients', (req, res) => clientController.getAllClients(req, res));
 
  router.delete('/clients/:id', (req, res) => clientController.deleteClient(req, res));

  router.get('/stats/clients', (req, res) => clientController.getClientStats(req, res));

  router.get('/profile', authenticateToken, requireClient, (req, res) => 
    clientController.getProfile(req as any, res)
  );
     router.put('/profile/edit', authenticateToken, requireClient, (req, res) => 
    clientController.updateProfile(req as any, res)
  );
  router.delete('/profile', authenticateToken, requireClient, (req, res) => 
    clientController.deleteProfile(req as any, res)
  );

  return router;
};