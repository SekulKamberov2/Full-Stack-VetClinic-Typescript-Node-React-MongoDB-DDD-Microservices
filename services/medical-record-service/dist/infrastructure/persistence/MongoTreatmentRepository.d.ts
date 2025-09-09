import { Treatment } from "../../domain/entities/Treatment";
import { TreatmentRepository } from "../../domain/repositories/TreatmentRepository";
export declare class MongoTreatmentRepository implements TreatmentRepository {
    findById(id: string): Promise<Treatment | null>;
    findByRecordId(recordId: string): Promise<Treatment[]>;
    findByName(name: string): Promise<Treatment[]>;
    findByCostRange(minCost: number, maxCost: number): Promise<Treatment[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Treatment[]>;
    findAll(): Promise<Treatment[]>;
    getStats(): Promise<{
        totalTreatments: number;
        totalCost: number;
        averageCost: number;
        treatmentsByRecord: Record<string, number>;
        costRange: {
            min: number;
            max: number;
            average: number;
        };
    }>;
    save(treatment: Treatment): Promise<Treatment>;
    update(treatment: Treatment): Promise<void>;
    updateById(id: string, updateData: Partial<Treatment>): Promise<void>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    search(query: string): Promise<Treatment[]>;
    private toEntity;
    private toDocument;
}
//# sourceMappingURL=MongoTreatmentRepository.d.ts.map