import { Request, Response } from "express";
import { GetTreatmentsByRecordUseCase } from "../../application/use-cases/GetTreatmentsByRecordUseCase";
import { GetTreatmentByIdUseCase } from "../../application/use-cases/GetTreatmentByIdUseCase";
import { BaseController, RequestValidator, NotFoundError } from "@vetclinic/shared-kernel";

export class TreatmentController extends BaseController {
  constructor(
    private getTreatmentsByRecordUseCase: GetTreatmentsByRecordUseCase,
    private getTreatmentByIdUseCase: GetTreatmentByIdUseCase 
  ) {
    super();
  }
 
  async getByRecordId(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;
      
      RequestValidator.validateObjectId(recordId, 'recordId', 'TreatmentController');

      const treatments = await this.getTreatmentsByRecordUseCase.execute(recordId);
      
      this.handleSuccess(res, {
        treatments: treatments,
        count: treatments.length,
        recordId: recordId
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { treatmentId } = req.params;
      
      RequestValidator.validateObjectId(treatmentId, 'treatmentId', 'TreatmentController');

      const treatment = await this.getTreatmentByIdUseCase.execute(treatmentId);
      
      if (!treatment) {
        throw new NotFoundError(
          `Treatment with ID ${treatmentId} not found`,
          undefined,
          'TreatmentController'
        );
      }

      this.handleSuccess(res, treatment);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
