import { ErrorHandler, NotFoundError, ValidationError } from "@vetclinic/shared-kernel";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";  

export class DeletePrescriptionUseCase {
  constructor(private prescriptionRepository: PrescriptionRepository) {} 

  async execute(prescriptionId: string): Promise<void> {
    try {
      if (!prescriptionId || prescriptionId.trim() === '') {
        throw new ValidationError("Prescription ID is required");
      }
  
      const exists = await this.prescriptionRepository.exists(prescriptionId);
      if (!exists) {
        throw new NotFoundError(`Prescription with ID ${prescriptionId} not found`);
      }
  
      await this.prescriptionRepository.delete(prescriptionId);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Delete prescription');
    }
  }
}
