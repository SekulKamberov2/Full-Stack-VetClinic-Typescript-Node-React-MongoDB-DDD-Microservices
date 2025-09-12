"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAppointmentsByVetUseCase = void 0;
class GetAppointmentsByVetUseCase {
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }
    async execute(veterinarianId) {
        return this.appointmentRepository.findByVeterinarianId(veterinarianId);
    }
}
exports.GetAppointmentsByVetUseCase = GetAppointmentsByVetUseCase;
//# sourceMappingURL=GetAppointmentsByVetUseCase.js.map