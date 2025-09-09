"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTreatmentByIdUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetTreatmentByIdUseCase {
    constructor(treatmentRepository) {
        this.treatmentRepository = treatmentRepository;
    }
    async execute(treatmentId) {
        try {
            if (!treatmentId || treatmentId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Treatment ID is required");
            }
            const treatment = await this.treatmentRepository.findById(treatmentId);
            if (!treatment) {
                throw new shared_kernel_1.NotFoundError(`Treatment with ID ${treatmentId} not found`);
            }
            return treatment;
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get treatment by ID');
        }
    }
}
exports.GetTreatmentByIdUseCase = GetTreatmentByIdUseCase;
//# sourceMappingURL=GetTreatmentByIdUseCase.js.map