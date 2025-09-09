"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMedicalRecordUseCase = void 0;
const MedicalRecord_1 = require("../../domain/entities/MedicalRecord");
const Diagnosis_1 = require("../../domain/entities/Diagnosis");
const Treatment_1 = require("../../domain/entities/Treatment");
const Prescription_1 = require("../../domain/entities/Prescription");
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class CreateMedicalRecordUseCase {
    constructor(medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }
    async execute(request) {
        try {
            const { patientId, clientId, veterinarianId, appointmentId, notes, diagnoses, treatments, prescriptions } = request;
            if (!patientId || !clientId || !veterinarianId) {
                throw new shared_kernel_1.ValidationError("Missing required fields: patient ID, client ID, and veterinarian ID are required");
            }
            if (appointmentId) {
                const existingRecord = await this.medicalRecordRepository.findByAppointmentId(appointmentId);
                if (existingRecord) {
                    throw new shared_kernel_1.DuplicateError(`Medical record already exists for appointment ${appointmentId}`);
                }
            }
            const diagnosisEntities = diagnoses?.map(diagnosisData => Diagnosis_1.Diagnosis.create({
                recordId: "",
                description: diagnosisData.description,
                date: diagnosisData.date || new Date(),
                notes: diagnosisData.notes,
            })) || [];
            const treatmentEntities = treatments?.map(treatmentData => Treatment_1.Treatment.create({
                recordId: "",
                name: treatmentData.name,
                description: treatmentData.description,
                date: treatmentData.date || new Date(),
                cost: treatmentData.cost,
            })) || [];
            const prescriptionEntities = prescriptions?.map(prescriptionData => Prescription_1.Prescription.create({
                recordId: "",
                medicationName: prescriptionData.medicationName,
                dosage: prescriptionData.dosage,
                instructions: prescriptionData.instructions,
                datePrescribed: prescriptionData.datePrescribed || new Date(),
                refills: prescriptionData.refills,
                filledDate: prescriptionData.filledDate,
                filledBy: prescriptionData.filledBy,
                status: prescriptionData.status || 'pending',
            })) || [];
            const medicalRecord = MedicalRecord_1.MedicalRecord.create({
                patientId,
                clientId,
                veterinarianId,
                appointmentId,
                notes,
                diagnoses: diagnosisEntities,
                treatments: treatmentEntities,
                prescriptions: prescriptionEntities,
            });
            return await this.medicalRecordRepository.save(medicalRecord);
        }
        catch (error) {
            shared_kernel_1.ErrorHandler.handleAppError(error, 'Create medical record');
        }
    }
}
exports.CreateMedicalRecordUseCase = CreateMedicalRecordUseCase;
//# sourceMappingURL=CreateMedicalRecordUseCase.js.map