"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMedicalRecordUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class DeleteMedicalRecordUseCase {
    constructor(medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }
    async execute(recordId) {
        try {
            const exists = await this.medicalRecordRepository.exists(recordId);
            if (!exists) {
                throw new shared_kernel_1.NotFoundError(`Medical record with ID ${recordId} not found`);
            }
            const deleted = await this.medicalRecordRepository.delete(recordId);
            if (!deleted) {
                throw new shared_kernel_1.AppError(`Failed to delete medical record with ID ${recordId}`, 'DELETE_FAILED');
            }
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Delete medical record');
        }
    }
}
exports.DeleteMedicalRecordUseCase = DeleteMedicalRecordUseCase;
//# sourceMappingURL=DeleteMedicalRecordUseCase.js.map