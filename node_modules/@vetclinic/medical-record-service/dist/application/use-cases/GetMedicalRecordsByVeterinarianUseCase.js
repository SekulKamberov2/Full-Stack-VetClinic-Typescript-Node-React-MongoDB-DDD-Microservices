"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMedicalRecordsByVeterinarianUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetMedicalRecordsByVeterinarianUseCase {
    constructor(medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }
    async execute(veterinarianId, page = 1, limit = 50) {
        try {
            const skip = (page - 1) * limit;
            const result = await this.medicalRecordRepository.findAll(skip, limit, { veterinarianId });
            return {
                records: result.records,
                pagination: {
                    page,
                    limit,
                    total: result.totalCount,
                    pages: Math.ceil(result.totalCount / limit)
                }
            };
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get medical records by veterinarian');
        }
    }
}
exports.GetMedicalRecordsByVeterinarianUseCase = GetMedicalRecordsByVeterinarianUseCase;
//# sourceMappingURL=GetMedicalRecordsByVeterinarianUseCase.js.map