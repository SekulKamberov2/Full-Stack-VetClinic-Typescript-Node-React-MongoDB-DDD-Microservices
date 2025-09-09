"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkPrescriptionFilledUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class MarkPrescriptionFilledUseCase {
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }
    async execute(prescriptionId, filledDate, filledBy) {
        try {
            if (!prescriptionId || prescriptionId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Prescription ID is required");
            }
            const exists = await this.prescriptionRepository.exists(prescriptionId);
            if (!exists) {
                throw new shared_kernel_1.NotFoundError(`Prescription with ID ${prescriptionId} not found`);
            }
            await this.prescriptionRepository.updateById(prescriptionId, {
                filledDate,
                filledBy,
                status: 'filled'
            });
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Mark prescription as filled');
        }
    }
}
exports.MarkPrescriptionFilledUseCase = MarkPrescriptionFilledUseCase;
//# sourceMappingURL=MarkPrescriptionFilledUseCase.js.map