import express from 'express';
import { PatientController } from '../controllers/PatientController';
import { VisitController } from '../controllers/VisitController';
import { AllergyController } from '../controllers/AllergyController';
import { VaccinationController } from '../controllers/VaccinationController';
import { MedicalAlertController } from '../controllers/MedicalAlertController';
import { PatientNoteController } from '../controllers/PatientNoteController';

export const createPatientRoutes = (
  patientController: PatientController, 
  visitController: VisitController,
  allergyController: AllergyController,
  vaccinationController: VaccinationController,
  medicalAlertController: MedicalAlertController,
  patientNoteController: PatientNoteController
) => {
  const router = express.Router();

  router.get('/patients', (req, res) => patientController.getAllPatients(req, res));
  router.post('/patients', (req, res) => patientController.createPatient(req, res));
  router.get('/patients/:id', (req, res) => patientController.getPatient(req, res));
  router.put('/patients/:id', (req, res) => patientController.updatePatient(req, res));
  router.delete('/patients/:id', (req, res) => patientController.deletePatient(req, res));
  router.get('/owners/:ownerId/patients', (req, res) => patientController.getPatientsByOwner(req, res)); 
 
  router.get('/visits', (req, res) => visitController.getAllVisits(req, res));
  router.post('/visits', (req, res) => visitController.createVisit(req, res));
  router.get('/visits/:id', (req, res) => visitController.getVisit(req, res));
  router.put('/visits/:id', (req, res) => visitController.updateVisit(req, res));
  router.delete('/visits/:id', (req, res) => visitController.deleteVisit(req, res));
  router.get('/patients/:patientId/visits', (req, res) => visitController.getVisitsByPatient(req, res));
  router.patch('/visits/:id/checkin', (req, res) => visitController.checkInVisit(req, res));
  router.patch('/visits/:id/complete', (req, res) => visitController.completeVisit(req, res));

  router.get('/allergies', (req, res) => allergyController.getAllAllergies(req, res));
  router.post('/allergies', (req, res) => allergyController.createAllergy(req, res));
  router.get('/allergies/:id', (req, res) => allergyController.getAllergy(req, res));
  router.put('/allergies/:id', (req, res) => allergyController.updateAllergy(req, res));
  router.delete('/allergies/:id', (req, res) => allergyController.deleteAllergy(req, res));
  router.get('/patients/:patientId/allergies', (req, res) => allergyController.getAllergiesByPatient(req, res));

  router.get('/vaccinations', (req, res) => vaccinationController.getAllVaccinations(req, res));
  router.post('/vaccinations', (req, res) => vaccinationController.createVaccination(req, res));
  router.get('/vaccinations/:id', (req, res) => vaccinationController.getVaccination(req, res));
  router.put('/vaccinations/:id', (req, res) => vaccinationController.updateVaccination(req, res));
  router.delete('/vaccinations/:id', (req, res) => vaccinationController.deleteVaccination(req, res));
  router.get('/patients/:patientId/vaccinations', (req, res) => vaccinationController.getVaccinationsByPatient(req, res));
  router.get('/vaccinations/due', (req, res) => vaccinationController.getDueVaccinations(req, res));

  router.get('/medical-alerts', (req, res) => medicalAlertController.getAllMedicalAlerts(req, res));
  router.post('/medical-alerts', (req, res) => medicalAlertController.createMedicalAlert(req, res));
  router.get('/medical-alerts/:id', (req, res) => medicalAlertController.getMedicalAlert(req, res));
  router.put('/medical-alerts/:id', (req, res) => medicalAlertController.updateMedicalAlert(req, res));
  router.delete('/medical-alerts/:id', (req, res) => medicalAlertController.deleteMedicalAlert(req, res));
  router.get('/patients/:patientId/medical-alerts', (req, res) => medicalAlertController.getMedicalAlertsByPatient(req, res));
 
  router.get('/patient-notes', (req, res) => patientNoteController.getAllPatientNotes(req, res));
  router.post('/patient-notes', (req, res) => patientNoteController.createPatientNote(req, res));
  router.get('/patient-notes/:id', (req, res) => patientNoteController.getPatientNote(req, res));
  router.put('/patient-notes/:id', (req, res) => patientNoteController.updatePatientNote(req, res));
  router.delete('/patient-notes/:id', (req, res) => patientNoteController.deletePatientNote(req, res));
  router.get('/patients/:patientId/patient-notes', (req, res) => patientNoteController.getPatientNotesByPatient(req, res));

  router.get('/owners/:ownerId/patients/:patientId/details', (req, res) => 
    patientController.getPatientWithDetailsByOwner(req, res)
  );

  return router;
};
