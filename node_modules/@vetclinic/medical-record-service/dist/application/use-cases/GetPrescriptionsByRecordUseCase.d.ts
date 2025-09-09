import { Prescription } from "../../domain/entities/Prescription";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
export declare class GetPrescriptionsByRecordUseCase {
    private prescriptionRepository;
    constructor(prescriptionRepository: PrescriptionRepository);
    execute(recordId: string): Promise<Prescription[]>;
}
//# sourceMappingURL=GetPrescriptionsByRecordUseCase.d.ts.map