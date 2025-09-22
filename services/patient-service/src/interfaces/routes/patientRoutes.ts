import express from 'express';
import { PatientController } from '../controllers/PatientController';

export const createPatientRoutes = (patientController: PatientController) => {
  const router = express.Router();
 
  router.get('/clients/:ownerId/patients', (req, res) => 
    patientController.getPatientsByOwner(req, res)
  );
 
  router.post('/patients', (req, res) => 
    patientController.createPatient(req, res)
  );
 
  router.get('/patients/:id', (req, res) => 
    patientController.getPatient(req, res)
  );
 
  router.get('/patients', (req, res) => 
    patientController.getAllPatients(req, res)
  );
 
  router.put('/patients/:id', (req, res) => 
    patientController.updatePatient(req, res)
  ); 

  router.patch('/patients/:id', (req, res) => 
    patientController.partialUpdatePatient(req, res)
  ); 
 
  router.delete('/patients/:id', (req, res) => 
    patientController.deletePatient(req, res)
  );

  return router;
};
