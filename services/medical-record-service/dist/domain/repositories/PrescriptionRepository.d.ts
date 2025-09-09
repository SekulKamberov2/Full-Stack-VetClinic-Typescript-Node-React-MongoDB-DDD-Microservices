import { Prescription } from "../entities/Prescription";
export interface PrescriptionRepository {
    findById(id: string): Promise<Prescription | null>;
    findByRecordId(recordId: string): Promise<Prescription[]>;
    findByMedicationName(medicationName: string): Promise<Prescription[]>;
    findByRefills(refills: number): Promise<Prescription[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Prescription[]>;
    findExpiringRefills(days?: number): Promise<Prescription[]>;
    findAll(): Promise<Prescription[]>;
    search(query: string): Promise<Prescription[]>;
    getStats(): Promise<{
        totalPrescriptions: number;
        prescriptionsWithRefills: number;
        prescriptionsByRecord: Record<string, number>;
        mostPrescribedMedications: {
            medication: string;
            count: number;
        }[];
    }>;
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
    }>;
    save(prescription: Prescription): Promise<Prescription>;
    update(prescription: Prescription): Promise<void>;
    updateById(id: string, updateData: Partial<Prescription>): Promise<void>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    decrementRefill(id: string): Promise<void>;
    bulkUpdateRefills(ids: string[], refills: number): Promise<void>;
}
//# sourceMappingURL=PrescriptionRepository.d.ts.map