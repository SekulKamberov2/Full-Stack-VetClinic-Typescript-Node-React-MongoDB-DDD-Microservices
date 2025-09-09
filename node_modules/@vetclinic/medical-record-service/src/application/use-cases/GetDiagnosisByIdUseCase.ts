import { ErrorHandler, NotFoundError, ValidationError } from "@vetclinic/shared-kernel";
import { Diagnosis } from "../../domain/entities/Diagnosis";
import { DiagnosisRepository } from "../../domain/repositories/DiagnosisRepository"; 

export class GetDiagnosisByIdUseCase {
  constructor(private diagnosisRepository: DiagnosisRepository) {}  

  async execute(diagnosisId: string): Promise<Diagnosis> {
    try {
      if (!diagnosisId || diagnosisId.trim() === '') {
        throw new ValidationError("Diagnosis ID is required");
      }

      const diagnosis = await this.diagnosisRepository.findById(diagnosisId);
      
      if (!diagnosis) {
        throw new NotFoundError(`Diagnosis with ID ${diagnosisId} not found`);
      }

      return diagnosis;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Get diagnosis by ID');
    }
  }
}
