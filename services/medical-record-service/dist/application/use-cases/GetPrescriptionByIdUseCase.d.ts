import { Prescription } from "../../domain/entities/Prescription";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
export declare class GetPrescriptionByIdUseCase {
    private prescriptionRepository;
    constructor(prescriptionRepository: PrescriptionRepository);
    execute(prescriptionId: string): Promise<Prescription>;
}
//# sourceMappingURL=GetPrescriptionByIdUseCase.d.ts.map