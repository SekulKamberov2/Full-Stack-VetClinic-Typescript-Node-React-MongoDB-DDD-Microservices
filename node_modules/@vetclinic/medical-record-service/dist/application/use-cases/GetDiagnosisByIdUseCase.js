"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDiagnosisByIdUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetDiagnosisByIdUseCase {
    constructor(diagnosisRepository) {
        this.diagnosisRepository = diagnosisRepository;
    }
    async execute(diagnosisId) {
        try {
            if (!diagnosisId || diagnosisId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Diagnosis ID is required");
            }
            const diagnosis = await this.diagnosisRepository.findById(diagnosisId);
            if (!diagnosis) {
                throw new shared_kernel_1.NotFoundError(`Diagnosis with ID ${diagnosisId} not found`);
            }
            return diagnosis;
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get diagnosis by ID');
        }
    }
}
exports.GetDiagnosisByIdUseCase = GetDiagnosisByIdUseCase;
//# sourceMappingURL=GetDiagnosisByIdUseCase.js.map