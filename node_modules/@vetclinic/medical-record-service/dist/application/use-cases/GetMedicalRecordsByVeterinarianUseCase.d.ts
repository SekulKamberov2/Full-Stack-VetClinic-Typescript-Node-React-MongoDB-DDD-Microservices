import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
export declare class GetMedicalRecordsByVeterinarianUseCase {
    private medicalRecordRepository;
    constructor(medicalRecordRepository: MedicalRecordRepository);
    execute(veterinarianId: string, page?: number, limit?: number): Promise<any>;
}
//# sourceMappingURL=GetMedicalRecordsByVeterinarianUseCase.d.ts.map