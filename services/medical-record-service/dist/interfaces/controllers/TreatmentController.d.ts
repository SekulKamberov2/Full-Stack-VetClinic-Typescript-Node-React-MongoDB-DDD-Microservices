import { Request, Response } from "express";
import { GetTreatmentsByRecordUseCase } from "../../application/use-cases/GetTreatmentsByRecordUseCase";
import { GetTreatmentByIdUseCase } from "../../application/use-cases/GetTreatmentByIdUseCase";
export declare class TreatmentController {
    private getTreatmentsByRecordUseCase;
    private getTreatmentByIdUseCase;
    constructor(getTreatmentsByRecordUseCase: GetTreatmentsByRecordUseCase, getTreatmentByIdUseCase: GetTreatmentByIdUseCase);
    getByRecordId(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    private handleError;
}
//# sourceMappingURL=TreatmentController.d.ts.map