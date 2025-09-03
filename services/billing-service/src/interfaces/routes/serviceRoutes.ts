import express from 'express';
import { ServiceController } from '../controllers/ServiceController';

export const createServiceRoutes = (serviceController: ServiceController) => {
  const router = express.Router();

  //important order .. query string
  router.get('/services/search', (req, res) => serviceController.searchServices(req, res));
  router.get('/services/name', (req, res) => serviceController.findServiceByName(req, res));
  //static request first
  router.get('/services/stats', (req, res) => serviceController.getServiceStats(req, res)); 
  router.get('/services/price-range', (req, res) => serviceController.findServicesByPriceRange(req, res));
  router.get('/services/active', (req, res) => serviceController.findAllActiveServices(req, res));
  router.post('/services', (req, res) => serviceController.createService(req, res));
  router.get('/services/:id', (req, res) => serviceController.getService(req, res));
  router.get('/services', (req, res) => serviceController.getAllServices(req, res));
  router.get('/services/category/:category', (req, res) => serviceController.getServicesByCategory(req, res)); 
  router.put('/services/:id', (req, res) => serviceController.updateService(req, res));
  router.delete('/services/:id', (req, res) => serviceController.deleteService(req, res)); 
  router.patch('/services/:id/reactivate', (req, res) => serviceController.reactivateService(req, res));

  return router;
};