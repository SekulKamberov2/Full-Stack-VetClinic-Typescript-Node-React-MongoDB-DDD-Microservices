"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMedicalRecordUseCase = void 0;
const MedicalRecord_1 = require("../../domain/entities/MedicalRecord");
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class UpdateMedicalRecordUseCase {
    constructor(medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }
    async execute(recordId, updateData) {
        try {
            const record = await this.medicalRecordRepository.findById(recordId);
            if (!record) {
                throw new shared_kernel_1.NotFoundError(`Medical record with ID ${recordId} not found`);
            }
            let updatedRecord = record;
            if (updateData.notes !== undefined) {
                updatedRecord = updatedRecord.updateNotes(updateData.notes);
            }
            if (updateData.diagnoses !== undefined) {
                updatedRecord = new MedicalRecord_1.MedicalRecord({
                    ...updatedRecord.toProps(),
                    diagnoses: updateData.diagnoses,
                    updatedAt: new Date(),
                });
            }
            if (updateData.treatments !== undefined) {
                updatedRecord = new MedicalRecord_1.MedicalRecord({
                    ...updatedRecord.toProps(),
                    treatments: updateData.treatments,
                    updatedAt: new Date(),
                });
            }
            if (updateData.prescriptions !== undefined) {
                updatedRecord = new MedicalRecord_1.MedicalRecord({
                    ...updatedRecord.toProps(),
                    prescriptions: updateData.prescriptions,
                    updatedAt: new Date(),
                });
            }
            await this.medicalRecordRepository.save(updatedRecord);
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Update medical record');
        }
    }
}
exports.UpdateMedicalRecordUseCase = UpdateMedicalRecordUseCase;
//# sourceMappingURL=UpdateMedicalRecordUseCase.js.map