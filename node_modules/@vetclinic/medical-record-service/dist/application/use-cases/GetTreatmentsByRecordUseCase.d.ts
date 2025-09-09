import { Treatment } from "../../domain/entities/Treatment";
import { TreatmentRepository } from "../../domain/repositories/TreatmentRepository";
export declare class GetTreatmentsByRecordUseCase {
    private treatmentRepository;
    constructor(treatmentRepository: TreatmentRepository);
    execute(recordId: string): Promise<Treatment[]>;
}
//# sourceMappingURL=GetTreatmentsByRecordUseCase.d.ts.map