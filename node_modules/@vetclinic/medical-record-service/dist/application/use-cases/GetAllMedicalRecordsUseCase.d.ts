import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
interface GetAllRecordsFilters {
    patientId?: string;
    clientId?: string;
    veterinarianId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}
export declare class GetAllMedicalRecordsUseCase {
    private medicalRecordRepository;
    constructor(medicalRecordRepository: MedicalRecordRepository);
    execute(options: {
        page: number;
        limit: number;
        filters?: GetAllRecordsFilters;
    }): Promise<any>;
}
export {};
//# sourceMappingURL=GetAllMedicalRecordsUseCase.d.ts.map