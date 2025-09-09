import { MedicalRecord } from "../../domain/entities/MedicalRecord";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
export interface GetMedicalRecordByIdRequest {
    recordId: string;
    requestingUserId?: string;
    requestingUserRole?: string;
}
export declare class GetMedicalRecordByIdUseCase {
    private medicalRecordRepository;
    constructor(medicalRecordRepository: MedicalRecordRepository);
    execute(request: GetMedicalRecordByIdRequest): Promise<MedicalRecord>;
    private validateRequest;
    private checkAuthorization;
}
//# sourceMappingURL=GetMedicalRecordByIdUseCase.d.ts.map