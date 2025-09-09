import { MedicalRecord } from "../../domain/entities/MedicalRecord";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
export interface CreateMedicalRecordRequest {
    patientId: string;
    clientId: string;
    veterinarianId: string;
    appointmentId?: string;
    notes?: string;
    diagnoses?: Array<{
        description: string;
        date?: Date;
        notes?: string;
    }>;
    treatments?: Array<{
        name: string;
        description: string;
        date?: Date;
        cost: number;
    }>;
    prescriptions?: Array<{
        medicationName: string;
        dosage: string;
        instructions: string;
        datePrescribed?: Date;
        refills: number;
        filledDate?: Date;
        filledBy?: string;
        status?: 'pending' | 'filled';
    }>;
}
export declare class CreateMedicalRecordUseCase {
    private medicalRecordRepository;
    constructor(medicalRecordRepository: MedicalRecordRepository);
    execute(request: CreateMedicalRecordRequest): Promise<MedicalRecord>;
}
//# sourceMappingURL=CreateMedicalRecordUseCase.d.ts.map