import { ErrorHandler, ValidationError } from "@vetclinic/shared-kernel";
import { Treatment } from "../../domain/entities/Treatment";
import { TreatmentRepository } from "../../domain/repositories/TreatmentRepository";  

export class GetTreatmentsByRecordUseCase {
  constructor(private treatmentRepository: TreatmentRepository) {}  
  async execute(recordId: string): Promise<Treatment[]> {
    try {
      if (!recordId || recordId.trim() === '') {
        throw new ValidationError("Record ID is required");
      }

      return await this.treatmentRepository.findByRecordId(recordId);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Get treatments by record');
    }
  }
}
