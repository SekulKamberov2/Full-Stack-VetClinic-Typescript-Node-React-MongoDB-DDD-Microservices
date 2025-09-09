"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDiagnosesByRecordUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetDiagnosesByRecordUseCase {
    constructor(diagnosisRepository) {
        this.diagnosisRepository = diagnosisRepository;
    }
    async execute(recordId) {
        try {
            if (!recordId || recordId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Record ID is required");
            }
            return await this.diagnosisRepository.findByRecordId(recordId);
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get diagnoses by record');
        }
    }
}
exports.GetDiagnosesByRecordUseCase = GetDiagnosesByRecordUseCase;
//# sourceMappingURL=GetDiagnosesByRecordUseCase.js.map