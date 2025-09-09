import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
export declare class MarkPrescriptionFilledUseCase {
    private prescriptionRepository;
    constructor(prescriptionRepository: PrescriptionRepository);
    execute(prescriptionId: string, filledDate: Date, filledBy: string): Promise<void>;
}
//# sourceMappingURL=MarkPrescriptionFilledUseCase.d.ts.map