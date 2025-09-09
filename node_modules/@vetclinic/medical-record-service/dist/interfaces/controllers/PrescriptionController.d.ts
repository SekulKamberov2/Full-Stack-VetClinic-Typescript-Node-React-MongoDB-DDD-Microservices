import { Request, Response } from "express";
import { GetPrescriptionsByRecordUseCase } from "../../application/use-cases/GetPrescriptionsByRecordUseCase";
import { GetPrescriptionByIdUseCase } from "../../application/use-cases/GetPrescriptionByIdUseCase";
import { UpdatePrescriptionUseCase } from "../../application/use-cases/UpdatePrescriptionUseCase";
import { DeletePrescriptionUseCase } from "../../application/use-cases/DeletePrescriptionUseCase";
import { MarkPrescriptionFilledUseCase } from "../../application/use-cases/MarkPrescriptionFilledUseCase";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
export declare class PrescriptionController {
    private getPrescriptionsByRecordUseCase;
    private getPrescriptionByIdUseCase;
    private updatePrescriptionUseCase;
    private deletePrescriptionUseCase;
    private markPrescriptionFilledUseCase;
    private addPrescriptionUseCase;
    constructor(medicalRecordRepository: MedicalRecordRepository, prescriptionRepository: PrescriptionRepository, getPrescriptionsByRecordUseCase: GetPrescriptionsByRecordUseCase, getPrescriptionByIdUseCase: GetPrescriptionByIdUseCase, updatePrescriptionUseCase: UpdatePrescriptionUseCase, deletePrescriptionUseCase: DeletePrescriptionUseCase, markPrescriptionFilledUseCase: MarkPrescriptionFilledUseCase);
    addPrescription(req: Request, res: Response): Promise<void>;
    getByRecordId(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    updatePrescription(req: Request, res: Response): Promise<void>;
    deletePrescription(req: Request, res: Response): Promise<void>;
    markAsFilled(req: Request, res: Response): Promise<void>;
    private handleError;
}
//# sourceMappingURL=PrescriptionController.d.ts.map