"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMedicalRecordByIdUseCase = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class GetMedicalRecordByIdUseCase {
    constructor(medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }
    async execute(request) {
        try {
            this.validateRequest(request);
            const record = await this.medicalRecordRepository.findById(request.recordId);
            if (!record) {
                throw new shared_kernel_1.NotFoundError(`Medical record with ID ${request.recordId} not found`);
            }
            this.checkAuthorization(record, request);
            return record;
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Get medical record by ID');
        }
    }
    validateRequest(request) {
        if (!request.recordId || request.recordId.trim() === '') {
            throw new shared_kernel_1.ValidationError("Medical record ID is required");
        }
        if (request.recordId.length < 3) {
            throw new shared_kernel_1.ValidationError("Medical record ID appears to be invalid");
        }
    }
    checkAuthorization(_record, request) {
        if (!request.requestingUserId || !request.requestingUserRole) {
            return;
        }
        throw new shared_kernel_1.AppError("Unauthorized: Insufficient permissions to access this medical record", 'UNAUTHORIZED');
    }
}
exports.GetMedicalRecordByIdUseCase = GetMedicalRecordByIdUseCase;
//# sourceMappingURL=GetMedicalRecordByIdUseCase.js.map