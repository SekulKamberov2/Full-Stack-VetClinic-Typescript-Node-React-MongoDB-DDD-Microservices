"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmAppointmentUseCase = void 0;
const AppointmentEvents_1 = require("../../domain/events/AppointmentEvents");
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class ConfirmAppointmentUseCase {
    constructor(appointmentRepository, eventPublisher) {
        this.appointmentRepository = appointmentRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(appointmentId, confirmedBy) {
        try {
            const appointment = await this.appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new shared_kernel_1.NotFoundError(`Appointment with ID ${appointmentId} not found`, undefined, 'ConfirmAppointmentUseCase');
            }
            const confirmedAppointment = appointment.confirm(confirmedBy);
            await this.appointmentRepository.save(confirmedAppointment);
            this.eventPublisher.publish(new AppointmentEvents_1.AppointmentConfirmedEvent(appointmentId, { confirmedBy }));
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'ConfirmAppointmentUseCase');
        }
    }
}
exports.ConfirmAppointmentUseCase = ConfirmAppointmentUseCase;
//# sourceMappingURL=ConfirmAppointmentUseCase.js.map