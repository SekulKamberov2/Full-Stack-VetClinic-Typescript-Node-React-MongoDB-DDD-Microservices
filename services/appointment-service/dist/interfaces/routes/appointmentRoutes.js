"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointmentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const createAppointmentRoutes = (appointmentController) => {
    const router = express_1.default.Router();
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
exports.createAppointmentRoutes = createAppointmentRoutes;
//# sourceMappingURL=appointmentRoutes.js.map