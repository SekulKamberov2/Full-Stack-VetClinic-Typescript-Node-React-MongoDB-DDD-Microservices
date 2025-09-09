import express from 'express';
import { ClientController } from '../controllers/ClientController';

export const createClientRoutes = (clientController: ClientController) => {
  const router = express.Router();
 
  router.post('/clients', (req, res) => clientController.createClient(req, res));
  router.get('/clients/:id', (req, res) => clientController.getClient(req, res));
  router.get('/clients', (req, res) => clientController.getAllClients(req, res));
  router.put('/clients/:id', (req, res) => clientController.updateClient(req, res));
  router.delete('/clients/:id', (req, res) => clientController.deleteClient(req, res));

  return router;
};