"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTreatmentsByRecordUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetTreatmentsByRecordUseCase {
    constructor(treatmentRepository) {
        this.treatmentRepository = treatmentRepository;
    }
    async execute(recordId) {
        try {
            if (!recordId || recordId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Record ID is required");
            }
            return await this.treatmentRepository.findByRecordId(recordId);
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get treatments by record');
        }
    }
}
exports.GetTreatmentsByRecordUseCase = GetTreatmentsByRecordUseCase;
//# sourceMappingURL=GetTreatmentsByRecordUseCase.js.map