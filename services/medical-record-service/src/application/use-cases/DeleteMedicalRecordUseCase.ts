import { ErrorHandler, NotFoundError } from "@vetclinic/shared-kernel";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";

export class DeleteMedicalRecordUseCase {
  constructor(private medicalRecordRepository: MedicalRecordRepository) {}

  async execute(recordId: string): Promise<void> {
    try {
      const deleted = await this.medicalRecordRepository.delete(recordId);
      
      if (!deleted) {
        throw new NotFoundError(`Medical record with ID ${recordId} not found`);
      }
      
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Delete medical record');
    }
  }
}
