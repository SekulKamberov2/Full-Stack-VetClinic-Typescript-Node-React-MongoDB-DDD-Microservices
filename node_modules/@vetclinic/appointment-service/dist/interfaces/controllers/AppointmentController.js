"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
class AppointmentController {
    constructor(createAppointmentUseCase, getAppointmentUseCase, getAppointmentsByVetUseCase, getAppointmentsByClientUseCase, confirmAppointmentUseCase, cancelAppointmentUseCase, completeAppointmentUseCase, startAppointmentUseCase) {
        this.createAppointmentUseCase = createAppointmentUseCase;
        this.getAppointmentUseCase = getAppointmentUseCase;
        this.getAppointmentsByVetUseCase = getAppointmentsByVetUseCase;
        this.getAppointmentsByClientUseCase = getAppointmentsByClientUseCase;
        this.confirmAppointmentUseCase = confirmAppointmentUseCase;
        this.cancelAppointmentUseCase = cancelAppointmentUseCase;
        this.completeAppointmentUseCase = completeAppointmentUseCase;
        this.startAppointmentUseCase = startAppointmentUseCase;
    }
    handleError(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return 'An unexpected error occurred';
    }
    async createAppointment(req, res) {
        try {
            console.log('Received appointment:', req.body);
            const { clientId, patientId, veterinarianId, appointmentDate, duration, reason, notes } = req.body;
            const appointment = await this.createAppointmentUseCase.execute({
                clientId,
                patientId,
                veterinarianId,
                appointmentDate: new Date(appointmentDate),
                duration,
                reason,
                notes
            });
            console.log('Appointment created successfully:', appointment.id);
            res.status(201).json({
                id: appointment.id,
                clientId: appointment.clientId,
                patientId: appointment.patientId,
                veterinarianId: appointment.veterinarianId,
                appointmentDate: appointment.appointmentDate,
                duration: appointment.duration,
                status: appointment.status,
                reason: appointment.reason,
                notes: appointment.notes
            });
        }
        catch (error) {
            const errorMessage = this.handleError(error);
            res.status(400).json({ error: errorMessage });
        }
    }
    async getAppointment(req, res) {
        try {
            const appointment = await this.getAppointmentUseCase.execute(req.params.id);
            if (!appointment) {
                res.status(404).json({ error: 'Appointment not found' });
                return;
            }
            res.json({
                id: appointment.id,
                clientId: appointment.clientId,
                patientId: appointment.patientId,
                veterinarianId: appointment.veterinarianId,
                appointmentDate: appointment.appointmentDate,
                duration: appointment.duration,
                status: appointment.status,
                reason: appointment.reason,
                notes: appointment.notes,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt
            });
        }
        catch (error) {
            const errorMessage = this.handleError(error);
            res.status(500).json({ error: errorMessage });
        }
    }
    async getAppointmentsByVet(req, res) {
        try {
            const appointments = await this.getAppointmentsByVetUseCase.execute(req.params.vetId);
            res.json(appointments.map(apt => ({
                id: apt.id,
                clientId: apt.clientId,
                patientId: apt.patientId,
                veterinarianId: apt.veterinarianId,
                appointmentDate: apt.appointmentDate,
                duration: apt.duration,
                status: apt.status,
                reason: apt.reason
            })));
        }
        catch (error) {
            const errorMessage = this.handleError(error);
            res.status(500).json({ error: errorMessage });
        }
    }
    async getAppointmentsByClient(req, res) {
        try {
            const appointments = await this.getAppointmentsByClientUseCase.execute(req.params.clientId);
            res.json(appointments.map(apt => ({
                id: apt.id,
                clientId: apt.clientId,
                patientId: apt.patientId,
                veterinarianId: apt.veterinarianId,
                appointmentDate: apt.appointmentDate,
                duration: apt.duration,
                status: apt.status,
                reason: apt.reason
            })));
        }
        catch (error) {
            const errorMessage = this.handleError(error);
            res.status(500).json({ error: errorMessage });
        }
    }
    async confirmAppointment(req, res) {
        try {
            const { confirmedBy } = req.body;
            await this.confirmAppointmentUseCase.execute(req.params.id, confirmedBy);
            res.status(200).json({ message: 'Appointment confirmed successfully' });
        }
        catch (error) {
            const errorMessage = this.handleError(error);
            res.status(400).json({ error: errorMessage });
        }
    }
    async startAppointment(req, res) {
        try {
            const { startedBy } = req.body;
            await this.startAppointmentUseCase.execute(req.params.id, startedBy);
            res.status(200).json({ message: 'Appointment started successfully' });
        }
        catch (error) {
            const errorMessage = this.handleError(error);
            res.status(400).json({ error: errorMessage });
        }
    }
    async cancelAppointment(req, res) {
        try {
            const { cancelledBy, reason } = req.body;
            await this.cancelAppointmentUseCase.execute(req.params.id, cancelledBy, reason);
            res.status(200).json({ message: 'Appointment cancelled successfully' });
        }
        catch (error) {
            const errorMessage = this.handleError(error);
            res.status(400).json({ error: errorMessage });
        }
    }
    async completeAppointment(req, res) {
        try {
            console.log('Complete appointment request:', req.params.id, req.body);
            const { completedBy, notes } = req.body;
            await this.completeAppointmentUseCase.execute(req.params.id, completedBy, notes);
            res.status(200).json({ message: 'Appointment completed successfully' });
        }
        catch (error) {
            const errorMessage = this.handleError(error);
            res.status(400).json({ error: errorMessage });
        }
    }
}
exports.AppointmentController = AppointmentController;
//# sourceMappingURL=AppointmentController.js.map