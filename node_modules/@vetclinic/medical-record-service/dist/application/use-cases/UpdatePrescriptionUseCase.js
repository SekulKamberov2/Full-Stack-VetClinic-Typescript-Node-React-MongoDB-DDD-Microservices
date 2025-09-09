"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePrescriptionUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class UpdatePrescriptionUseCase {
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }
    async execute(prescriptionId, updateData) {
        try {
            if (!prescriptionId || prescriptionId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Prescription ID is required");
            }
            const exists = await this.prescriptionRepository.exists(prescriptionId);
            if (!exists) {
                throw new shared_kernel_1.NotFoundError(`Prescription with ID ${prescriptionId} not found`);
            }
            await this.prescriptionRepository.updateById(prescriptionId, updateData);
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Update prescription');
        }
    }
}
exports.UpdatePrescriptionUseCase = UpdatePrescriptionUseCase;
//# sourceMappingURL=UpdatePrescriptionUseCase.js.map