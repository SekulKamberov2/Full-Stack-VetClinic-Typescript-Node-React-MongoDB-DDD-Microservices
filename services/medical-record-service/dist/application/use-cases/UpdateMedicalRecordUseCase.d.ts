import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
import { Diagnosis } from "../../domain/entities/Diagnosis";
import { Treatment } from "../../domain/entities/Treatment";
import { Prescription } from "../../domain/entities/Prescription";
export declare class UpdateMedicalRecordUseCase {
    private medicalRecordRepository;
    constructor(medicalRecordRepository: MedicalRecordRepository);
    execute(recordId: string, updateData: {
        notes?: string;
        diagnoses?: Diagnosis[];
        treatments?: Treatment[];
        prescriptions?: Prescription[];
    }): Promise<void>;
}
//# sourceMappingURL=UpdateMedicalRecordUseCase.d.ts.map