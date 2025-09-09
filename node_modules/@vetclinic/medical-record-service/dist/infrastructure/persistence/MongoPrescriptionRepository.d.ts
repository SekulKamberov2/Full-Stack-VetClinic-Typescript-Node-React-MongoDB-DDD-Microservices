import { Prescription } from "../../domain/entities/Prescription";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
export declare class MongoPrescriptionRepository implements PrescriptionRepository {
    findById(id: string): Promise<Prescription | null>;
    findByRecordId(recordId: string): Promise<Prescription[]>;
    findByMedicationName(medicationName: string): Promise<Prescription[]>;
    findByRefills(refills: number): Promise<Prescription[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Prescription[]>;
    findByStatus(status: string): Promise<Prescription[]>;
    findExpiringRefills(days?: number): Promise<Prescription[]>;
    findAll(): Promise<Prescription[]>;
    exists(id: string): Promise<boolean>;
    getStats(): Promise<{
        totalPrescriptions: number;
        prescriptionsWithRefills: number;
        prescriptionsByRecord: Record<string, number>;
        mostPrescribedMedications: {
            medication: string;
            count: number;
        }[];
        prescriptionsByStatus: Record<string, number>;
    }>;
    save(prescription: Prescription): Promise<Prescription>;
    private saveWithTransaction;
    private saveWithoutTransaction;
    update(prescription: Prescription): Promise<void>;
    updateById(id: string, updateData: Partial<Prescription>): Promise<void>;
    delete(id: string): Promise<void>;
    private deleteWithTransaction;
    private deleteWithoutTransaction;
    search(query: string): Promise<Prescription[]>;
    getPrescriptionStats(): Promise<{
        total: number;
        withRefills: number;
        byRecord: Record<string, number>;
        topMedications: {
            medication: string;
            count: number;
        }[];
        refillDistribution: {
            refills: number;
            count: number;
        }[];
        byStatus: Record<string, number>;
    }>;
    decrementRefill(id: string): Promise<void>;
    bulkUpdateRefills(ids: string[], refills: number): Promise<void>;
    markAsFilled(id: string, filledDate: Date, filledBy: string): Promise<void>;
    private isTransactionError;
    private toEntity;
    private toDocument;
}
//# sourceMappingURL=MongoPrescriptionRepository.d.ts.map