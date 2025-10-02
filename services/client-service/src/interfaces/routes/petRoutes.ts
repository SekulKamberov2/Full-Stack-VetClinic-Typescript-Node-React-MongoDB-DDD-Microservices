import express from 'express';
import { PetController } from '../controllers/PetController';

export const createPetRoutes = (petController: PetController) => {
  const router = express.Router();

  router.post('/pets', (req, res) => petController.createPet(req, res));
  router.get('/pets/:id', (req, res) => petController.getPet(req, res));
  router.get('/pets', (req, res) => petController.getAllPets(req, res));
  router.put('/pets/:id', (req, res) => petController.updatePet(req, res));
  router.delete('/pets/:id', (req, res) => petController.deletePet(req, res));

  router.get('/clients/:clientId/pets', (req, res) => petController.getClientPets(req, res));
  router.post('/clients/:clientId/pets', (req, res) => petController.createPet(req, res));
  router.delete('/clients/:clientId/pets/:petId', (req, res) => petController.deletePet(req, res));

  router.get('/pets/search/:query', (req, res) => petController.searchPets(req, res));
  router.post('/pets/:petId/vaccinations', (req, res) => petController.addVaccinationRecord(req, res));
  router.put('/pets/:petId/vaccinations/:vaccineId/complete', (req, res) => petController.completeVaccination(req, res));

  router.get('/stats/pets', (req, res) => petController.getPetStats(req, res));

  return router;
};