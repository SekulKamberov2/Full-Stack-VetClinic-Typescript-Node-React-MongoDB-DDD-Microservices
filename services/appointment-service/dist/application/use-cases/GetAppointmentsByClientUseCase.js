"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAppointmentsByClientUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetAppointmentsByClientUseCase {
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }
    async execute(clientId) {
        try {
            if (!clientId || clientId.trim() === '') {
                throw new shared_kernel_1.ValidationError('Client ID is required', undefined, 'GetAppointmentsByClientUseCase');
            }
            return await this.appointmentRepository.findByClientId(clientId);
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'GetAppointmentsByClientUseCase');
        }
    }
}
exports.GetAppointmentsByClientUseCase = GetAppointmentsByClientUseCase;
//# sourceMappingURL=GetAppointmentsByClientUseCase.js.map