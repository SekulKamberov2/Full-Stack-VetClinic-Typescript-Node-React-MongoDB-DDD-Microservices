import { MedicalRecord } from "../../domain/entities/MedicalRecord";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
import { EventPublisher } from "../../shared/domain/EventPublisher";
export declare class MongoMedicalRecordRepository implements MedicalRecordRepository {
    private eventPublisher;
    constructor(eventPublisher: EventPublisher);
    private isValidObjectId;
    private filterValidIds;
    findById(id: string): Promise<MedicalRecord | null>;
    findByPatientId(patientId: string): Promise<MedicalRecord[]>;
    findByClientId(clientId: string): Promise<MedicalRecord[]>;
    findByVeterinarianId(veterinarianId: string): Promise<MedicalRecord[]>;
    findByAppointmentId(appointmentId: string): Promise<MedicalRecord | null>;
    save(record: MedicalRecord): Promise<MedicalRecord>;
    private saveWithTransaction;
    private saveWithoutTransaction;
    private isTransactionError;
    findAll(skip?: number, limit?: number, filters?: {
        patientId?: string;
        clientId?: string;
        veterinarianId?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<{
        records: MedicalRecord[];
        totalCount: number;
    }>;
    exists(id: string): Promise<boolean>;
    delete(id: string): Promise<boolean>;
    cleanupCorruptedData(): Promise<void>;
    private toDomain;
    private toPersistence;
    private diagnosisToPersistence;
    private treatmentToPersistence;
    private prescriptionToPersistence;
}
//# sourceMappingURL=MongoMedicalRecordRepository.d.ts.map