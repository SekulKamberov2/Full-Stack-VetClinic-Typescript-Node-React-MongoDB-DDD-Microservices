import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
export declare class DeleteMedicalRecordUseCase {
    private medicalRecordRepository;
    constructor(medicalRecordRepository: MedicalRecordRepository);
    execute(recordId: string): Promise<void>;
}
//# sourceMappingURL=DeleteMedicalRecordUseCase.d.ts.map