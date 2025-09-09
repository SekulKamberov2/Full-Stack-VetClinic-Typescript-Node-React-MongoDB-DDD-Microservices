"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPrescriptionsByRecordUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetPrescriptionsByRecordUseCase {
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }
    async execute(recordId) {
        try {
            if (!recordId || recordId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Record ID is required");
            }
            return await this.prescriptionRepository.findByRecordId(recordId);
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get prescriptions by record');
        }
    }
}
exports.GetPrescriptionsByRecordUseCase = GetPrescriptionsByRecordUseCase;
//# sourceMappingURL=GetPrescriptionsByRecordUseCase.js.map