import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
export declare class GetMedicalRecordsByPatientUseCase {
    private medicalRecordRepository;
    constructor(medicalRecordRepository: MedicalRecordRepository);
    execute(patientId: string, page?: number, limit?: number): Promise<any>;
}
//# sourceMappingURL=GetMedicalRecordByPatientUseCase.d.ts.map