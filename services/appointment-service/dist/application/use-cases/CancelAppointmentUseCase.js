"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelAppointmentUseCase = void 0;
const AppointmentEvents_1 = require("../../domain/events/AppointmentEvents");
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class CancelAppointmentUseCase {
    constructor(appointmentRepository, eventPublisher) {
        this.appointmentRepository = appointmentRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(appointmentId, cancelledBy, reason) {
        try {
            const appointment = await this.appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new shared_kernel_1.NotFoundError(`Appointment with ID ${appointmentId} not found`, undefined, 'CancelAppointmentUseCase');
            }
            const cancelledAppointment = appointment.cancel(cancelledBy, reason);
            await this.appointmentRepository.save(cancelledAppointment);
            this.eventPublisher.publish(new AppointmentEvents_1.AppointmentCancelledEvent(appointmentId, { cancelledBy, reason }));
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'CancelAppointmentUseCase');
        }
    }
}
exports.CancelAppointmentUseCase = CancelAppointmentUseCase;
//# sourceMappingURL=CancelAppointmentUseCase.js.map