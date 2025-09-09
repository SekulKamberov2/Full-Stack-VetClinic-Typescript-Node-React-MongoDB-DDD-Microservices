"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePrescriptionUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class DeletePrescriptionUseCase {
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }
    async execute(prescriptionId) {
        try {
            if (!prescriptionId || prescriptionId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Prescription ID is required");
            }
            const exists = await this.prescriptionRepository.exists(prescriptionId);
            if (!exists) {
                throw new shared_kernel_1.NotFoundError(`Prescription with ID ${prescriptionId} not found`);
            }
            await this.prescriptionRepository.delete(prescriptionId);
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Delete prescription');
        }
    }
}
exports.DeletePrescriptionUseCase = DeletePrescriptionUseCase;
//# sourceMappingURL=DeletePrescriptionUseCase.js.map