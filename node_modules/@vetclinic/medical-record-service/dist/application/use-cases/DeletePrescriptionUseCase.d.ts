import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
export declare class DeletePrescriptionUseCase {
    private prescriptionRepository;
    constructor(prescriptionRepository: PrescriptionRepository);
    execute(prescriptionId: string): Promise<void>;
}
//# sourceMappingURL=DeletePrescriptionUseCase.d.ts.map