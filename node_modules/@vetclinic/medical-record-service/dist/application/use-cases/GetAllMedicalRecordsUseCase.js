"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllMedicalRecordsUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetAllMedicalRecordsUseCase {
    constructor(medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }
    async execute(options) {
        try {
            const skip = (options.page - 1) * options.limit;
            const result = await this.medicalRecordRepository.findAll(skip, options.limit, options.filters);
            return {
                records: result.records,
                pagination: {
                    page: options.page,
                    limit: options.limit,
                    total: result.totalCount,
                    pages: Math.ceil(result.totalCount / options.limit)
                },
                filters: options.filters
            };
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get all medical records');
        }
    }
}
exports.GetAllMedicalRecordsUseCase = GetAllMedicalRecordsUseCase;
//# sourceMappingURL=GetAllMedicalRecordsUseCase.js.map