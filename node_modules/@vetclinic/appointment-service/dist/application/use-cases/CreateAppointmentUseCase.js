"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAppointmentUseCase = void 0;
const Appointment_1 = require("../../domain/entities/Appointment");
const AppointmentEvents_1 = require("../../domain/events/AppointmentEvents");
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class CreateAppointmentUseCase {
    constructor(appointmentRepository, eventPublisher) {
        this.appointmentRepository = appointmentRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(appointmentData) {
        try {
            await this.validateAppointmentData(appointmentData);
            await this.checkVeterinarianAvailability(appointmentData.veterinarianId, appointmentData.appointmentDate, appointmentData.duration);
            const appointment = Appointment_1.Appointment.create({
                ...appointmentData,
                status: Appointment_1.AppointmentStatus.SCHEDULED
            });
            const savedAppointment = await this.appointmentRepository.save(appointment);
            this.eventPublisher.publish(new AppointmentEvents_1.AppointmentCreatedEvent(savedAppointment.id, {
                clientId: savedAppointment.clientId,
                patientId: savedAppointment.patientId,
                veterinarianId: savedAppointment.veterinarianId,
                appointmentDate: savedAppointment.appointmentDate,
                duration: savedAppointment.duration,
                reason: savedAppointment.reason
            }));
            return savedAppointment;
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'CreateAppointmentUseCase');
        }
    }
    async validateAppointmentData(data) {
        const requiredFields = ['clientId', 'patientId', 'veterinarianId', 'appointmentDate', 'duration', 'reason'];
        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                throw new shared_kernel_1.ValidationError(`${field} is required`, undefined, 'CreateAppointmentUseCase');
            }
        }
        if (data.duration < 5 || data.duration > 480) {
            throw new shared_kernel_1.ValidationError('Duration must be between 5 and 480 minutes', undefined, 'CreateAppointmentUseCase');
        }
        if (data.appointmentDate <= new Date()) {
            throw new shared_kernel_1.ValidationError('Appointment date must be in the future', undefined, 'CreateAppointmentUseCase');
        }
    }
    async checkVeterinarianAvailability(veterinarianId, appointmentDate, duration) {
        const startTime = new Date(appointmentDate);
        const endTime = new Date(appointmentDate.getTime() + duration * 60000);
        const existingAppointments = await this.appointmentRepository.findConflictingAppointments(veterinarianId, startTime, duration);
        if (existingAppointments.length > 0) {
            throw new shared_kernel_1.ValidationError('Veterinarian is not available at the requested time. Please choose a different time slot.', undefined, 'CreateAppointmentUseCase');
        }
    }
}
exports.CreateAppointmentUseCase = CreateAppointmentUseCase;
//# sourceMappingURL=CreateAppointmentUseCase.js.map