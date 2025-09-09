import { Request, Response } from "express";
import { GetDiagnosesByRecordUseCase } from "../../application/use-cases/GetDiagnosesByRecordUseCase";
import { GetDiagnosisByIdUseCase } from "../../application/use-cases/GetDiagnosisByIdUseCase";
export declare class DiagnosisController {
    private getDiagnosesByRecordUseCase;
    private getDiagnosisByIdUseCase;
    constructor(getDiagnosesByRecordUseCase: GetDiagnosesByRecordUseCase, getDiagnosisByIdUseCase: GetDiagnosisByIdUseCase);
    getByRecordId(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    private handleError;
}
//# sourceMappingURL=DiagnosisController.d.ts.map