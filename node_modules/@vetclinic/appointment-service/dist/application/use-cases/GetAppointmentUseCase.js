"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAppointmentUseCase = void 0;
class GetAppointmentUseCase {
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }
    async execute(id) {
        return this.appointmentRepository.findById(id);
    }
}
exports.GetAppointmentUseCase = GetAppointmentUseCase;
//# sourceMappingURL=GetAppointmentUseCase.js.map