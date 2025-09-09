import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
import { Prescription } from "../../domain/entities/Prescription";
export declare class AddPrescriptionToRecordUseCase {
    private medicalRecordRepository;
    private prescriptionRepository;
    constructor(medicalRecordRepository: MedicalRecordRepository, prescriptionRepository: PrescriptionRepository);
    execute(recordId: string, medicationName: string, dosage: string, instructions: string, refills: number, datePrescribed?: Date, status?: string): Promise<Prescription>;
}
//# sourceMappingURL=AddPrescriptionToRecordUseCase.d.ts.map