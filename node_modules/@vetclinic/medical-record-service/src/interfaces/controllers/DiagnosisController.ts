import { Request, Response } from "express";
import { GetDiagnosesByRecordUseCase } from "../../application/use-cases/GetDiagnosesByRecordUseCase";
import { GetDiagnosisByIdUseCase } from "../../application/use-cases/GetDiagnosisByIdUseCase";
import { BaseController, NotFoundError, RequestValidator  } from "@vetclinic/shared-kernel";
 
export class DiagnosisController extends BaseController {
  [x: string]: any;
  constructor(
    private getDiagnosesByRecordUseCase: GetDiagnosesByRecordUseCase,
    private getDiagnosisByIdUseCase: GetDiagnosisByIdUseCase 
  ) {
    super();
  }

  async getByRecordId(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;
      
      RequestValidator.validateObjectId(recordId, 'recordId', 'DiagnosisController');

      const diagnoses = await this.getDiagnosesByRecordUseCase.execute(recordId);
      this.handleSuccess(res, diagnoses);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { diagnosisId } = req.params;
      
      RequestValidator.validateObjectId(diagnosisId, 'diagnosisId', 'DiagnosisController');

      const diagnosis = await this.getDiagnosisByIdUseCase.execute(diagnosisId);
      
      if (!diagnosis) {
        throw new NotFoundError(
          `Diagnosis with ID ${diagnosisId} not found`, 
          undefined, 
          'DiagnosisController'
        );
      }

      this.handleSuccess(res, diagnosis);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
