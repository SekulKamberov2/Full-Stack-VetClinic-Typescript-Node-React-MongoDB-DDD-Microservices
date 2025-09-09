"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMedicalRecordsByPatientUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetMedicalRecordsByPatientUseCase {
    constructor(medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }
    async execute(patientId, page = 1, limit = 50) {
        try {
            const skip = (page - 1) * limit;
            const result = await this.medicalRecordRepository.findAll(skip, limit, { patientId });
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
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get medical records by patient');
        }
    }
}
exports.GetMedicalRecordsByPatientUseCase = GetMedicalRecordsByPatientUseCase;
//# sourceMappingURL=GetMedicalRecordByPatientUseCase.js.map