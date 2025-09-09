import { AppError, ErrorHandler, NotFoundError } from "@vetclinic/shared-kernel";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";

export class DeleteMedicalRecordUseCase {
  constructor(private medicalRecordRepository: MedicalRecordRepository) {}

  async execute(recordId: string): Promise<void> {
    try {
      const exists = await this.medicalRecordRepository.exists(recordId);
      
      if (!exists) {
        throw new NotFoundError(`Medical record with ID ${recordId} not found`);
      }

      const deleted = await this.medicalRecordRepository.delete(recordId);
      
      if (!deleted) {
        throw new AppError(`Failed to delete medical record with ID ${recordId}`, 'DELETE_FAILED');
      }
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Delete medical record');
    }
  }
}
