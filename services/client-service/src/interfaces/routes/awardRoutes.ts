import express from 'express';
import { AwardController } from '../controllers/AwardController';

export const createAwardRoutes = (awardController: AwardController) => {
  const router = express.Router();

  router.post('/awards', (req, res) => awardController.grantAward(req, res));
  router.get('/awards/:id', (req, res) => awardController.getAward(req, res));
  router.get('/awards', (req, res) => awardController.getAllAwards(req, res));
  router.put('/awards/:id', (req, res) => awardController.updateAward(req, res));
  router.delete('/awards/:id', (req, res) => awardController.revokeAward(req, res));

  router.post('/pets/:petId/awards', (req, res) => awardController.grantAward(req, res));
  router.get('/pets/:petId/awards', (req, res) => awardController.getPetAwards(req, res));

  router.get('/clients/:clientId/awards', (req, res) => awardController.getClientAwards(req, res));

  router.get('/stats/awards', (req, res) => awardController.getAwardStats(req, res));

  return router;
};