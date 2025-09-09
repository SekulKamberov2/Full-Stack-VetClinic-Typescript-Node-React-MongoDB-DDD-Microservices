import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
export declare class GetMedicalRecordsByClientUseCase {
    private medicalRecordRepository;
    constructor(medicalRecordRepository: MedicalRecordRepository);
    execute(clientId: string, page?: number, limit?: number): Promise<any>;
}
//# sourceMappingURL=GetMedicalRecordsByClientUseCase.d.ts.map