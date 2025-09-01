import express from 'express';
import { AppointmentController } from '../controllers/AppointmentController';

export const createAppointmentRoutes = (appointmentController: AppointmentController) => {
  const router = express.Router();

  router.post('/appointments', (req, res) => appointmentController.createAppointment(req, res));
  router.get('/appointments/:id', (req, res) => appointmentController.getAppointment(req, res));
  router.get('/vets/:vetId/appointments', (req, res) => appointmentController.getAppointmentsByVet(req, res));
  router.get('/clients/:clientId/appointments', (req, res) => appointmentController.getAppointmentsByClient(req, res));

  router.patch('/appointments/:id/confirm', (req, res) => appointmentController.confirmAppointment(req, res));
  router.patch('/appointments/:id/start', (req, res) => appointmentController.startAppointment(req, res));
  router.patch('/appointments/:id/complete', (req, res) => appointmentController.completeAppointment(req, res));
  router.patch('/appointments/:id/cancel', (req, res) => appointmentController.cancelAppointment(req, res));
  
  return router;
};