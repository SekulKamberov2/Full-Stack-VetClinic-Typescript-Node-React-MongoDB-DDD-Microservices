"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPrescriptionToRecordUseCase = void 0;
const Prescription_1 = require("../../domain/entities/Prescription");
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class AddPrescriptionToRecordUseCase {
    constructor(medicalRecordRepository, prescriptionRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
    }
    async execute(recordId, medicationName, dosage, instructions, refills, datePrescribed, status = 'pending') {
        try {
            if (!recordId || recordId.trim() === '') {
                throw new shared_kernel_1.ValidationError("Record ID is required");
            }
            if (!medicationName || medicationName.trim() === '') {
                throw new shared_kernel_1.ValidationError("Medication name is required");
            }
            if (!dosage || dosage.trim() === '') {
                throw new shared_kernel_1.ValidationError("Dosage is required");
            }
            if (refills === undefined || refills === null || refills < 0) {
                throw new shared_kernel_1.ValidationError("Valid refills count is required");
            }
            const validStatuses = ['pending', 'processing', 'filled', 'cancelled', 'completed'];
            if (status && !validStatuses.includes(status)) {
                throw new shared_kernel_1.ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            }
            const record = await this.medicalRecordRepository.findById(recordId);
            if (!record) {
                throw new shared_kernel_1.NotFoundError(`Medical record with ID ${recordId} not found`);
            }
            const finalDatePrescribed = datePrescribed || new Date();
            const prescriptionProps = {
                recordId,
                medicationName: medicationName.trim(),
                dosage: dosage.trim(),
                instructions: instructions ? instructions.trim() : "",
                datePrescribed: finalDatePrescribed,
                refills,
                status: status
            };
            const prescription = Prescription_1.Prescription.create(prescriptionProps);
            const savedPrescription = await this.prescriptionRepository.save(prescription);
            console.log('Successfully saved prescription:', savedPrescription.id);
            return savedPrescription;
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Add prescription to record');
        }
    }
}
exports.AddPrescriptionToRecordUseCase = AddPrescriptionToRecordUseCase;
//# sourceMappingURL=AddPrescriptionToRecordUseCase.js.map