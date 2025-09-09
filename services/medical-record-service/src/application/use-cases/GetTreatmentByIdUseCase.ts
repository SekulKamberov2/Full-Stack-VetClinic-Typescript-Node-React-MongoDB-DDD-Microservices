import { ErrorHandler, NotFoundError, ValidationError } from "@vetclinic/shared-kernel";
import { Treatment } from "../../domain/entities/Treatment";
import { TreatmentRepository } from "../../domain/repositories/TreatmentRepository"; 

export class GetTreatmentByIdUseCase {
  constructor(private treatmentRepository: TreatmentRepository) {}  

  async execute(treatmentId: string): Promise<Treatment> {
    try {
      if (!treatmentId || treatmentId.trim() === '') {
        throw new ValidationError("Treatment ID is required");
      }

      const treatment = await this.treatmentRepository.findById(treatmentId);
      
      if (!treatment) {
        throw new NotFoundError(`Treatment with ID ${treatmentId} not found`);
      }

      return treatment;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Get treatment by ID');
    }
  }
}
