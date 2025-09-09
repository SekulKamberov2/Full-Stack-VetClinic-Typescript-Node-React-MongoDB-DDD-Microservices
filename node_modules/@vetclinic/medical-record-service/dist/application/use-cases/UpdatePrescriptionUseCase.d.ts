import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
export declare class UpdatePrescriptionUseCase {
    private prescriptionRepository;
    constructor(prescriptionRepository: PrescriptionRepository);
    execute(prescriptionId: string, updateData: any): Promise<void>;
}
//# sourceMappingURL=UpdatePrescriptionUseCase.d.ts.map