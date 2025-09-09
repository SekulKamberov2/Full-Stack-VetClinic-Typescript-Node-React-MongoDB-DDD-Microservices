import { ErrorHandler, ValidationError } from "@vetclinic/shared-kernel";
import { Diagnosis } from "../../domain/entities/Diagnosis";
import { DiagnosisRepository } from "../../domain/repositories/DiagnosisRepository"; 

export class GetDiagnosesByRecordUseCase {
  constructor(private diagnosisRepository: DiagnosisRepository) {} 

  async execute(recordId: string): Promise<Diagnosis[]> {
    try {
      if (!recordId || recordId.trim() === '') {
        throw new ValidationError("Record ID is required");
      }

      return await this.diagnosisRepository.findByRecordId(recordId);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Get diagnoses by record');
    }
  }
}
