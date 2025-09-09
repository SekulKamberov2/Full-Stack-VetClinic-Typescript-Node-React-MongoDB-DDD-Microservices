import { Treatment } from "../../domain/entities/Treatment";
import { TreatmentRepository } from "../../domain/repositories/TreatmentRepository";
export declare class GetTreatmentByIdUseCase {
    private treatmentRepository;
    constructor(treatmentRepository: TreatmentRepository);
    execute(treatmentId: string): Promise<Treatment>;
}
//# sourceMappingURL=GetTreatmentByIdUseCase.d.ts.map