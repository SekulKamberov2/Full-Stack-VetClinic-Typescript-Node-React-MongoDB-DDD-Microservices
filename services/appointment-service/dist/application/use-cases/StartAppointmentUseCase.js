"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartAppointmentUseCase = void 0;
const AppointmentEvents_1 = require("../../domain/events/AppointmentEvents");
class StartAppointmentUseCase {
    constructor(appointmentRepository, eventPublisher) {
        this.appointmentRepository = appointmentRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(appointmentId, startedBy) {
        const appointment = await this.appointmentRepository.findById(appointmentId);
        if (!appointment)
            throw new Error('Appointment not found');
        const startedAppointment = appointment.start();
        await this.appointmentRepository.save(startedAppointment);
        this.eventPublisher.publish(new AppointmentEvents_1.AppointmentStartedEvent(appointmentId, { startedBy }));
    }
}
exports.StartAppointmentUseCase = StartAppointmentUseCase;
//# sourceMappingURL=StartAppointmentUseCase.js.map