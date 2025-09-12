"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteAppointmentUseCase = void 0;
const AppointmentEvents_1 = require("../../domain/events/AppointmentEvents");
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class CompleteAppointmentUseCase {
    constructor(appointmentRepository, eventPublisher) {
        this.appointmentRepository = appointmentRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(appointmentId, completedBy, notes) {
        try {
            const appointment = await this.appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new shared_kernel_1.NotFoundError(`Appointment with ID ${appointmentId} not found`, undefined, 'CompleteAppointmentUseCase');
            }
            const completedAppointment = appointment.complete(completedBy, notes);
            await this.appointmentRepository.save(completedAppointment);
            this.eventPublisher.publish(new AppointmentEvents_1.AppointmentCompletedEvent(appointmentId, { completedBy, notes }));
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'CompleteAppointmentUseCase');
        }
    }
}
exports.CompleteAppointmentUseCase = CompleteAppointmentUseCase;
//# sourceMappingURL=CompleteAppointmentUseCase.js.map