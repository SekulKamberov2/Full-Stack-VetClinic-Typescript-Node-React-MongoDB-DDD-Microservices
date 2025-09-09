"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPrescriptionByIdUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetPrescriptionByIdUseCase {
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }
    async execute(prescriptionId) {
        try {
            if (!prescriptionId || prescriptionId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Prescription ID is required");
            }
            const prescription = await this.prescriptionRepository.findById(prescriptionId);
            if (!prescription) {
                throw new shared_kernel_1.NotFoundError(`Prescription with ID ${prescriptionId} not found`);
            }
            return prescription;
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get prescription by ID');
        }
    }
}
exports.GetPrescriptionByIdUseCase = GetPrescriptionByIdUseCase;
//# sourceMappingURL=GetPrescriptionByIdUseCase.js.map