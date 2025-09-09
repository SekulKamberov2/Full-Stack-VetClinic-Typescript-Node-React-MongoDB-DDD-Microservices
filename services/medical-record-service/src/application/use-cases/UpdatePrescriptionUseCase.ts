import { ErrorHandler, NotFoundError, ValidationError } from "@vetclinic/shared-kernel";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";

export class UpdatePrescriptionUseCase {
  constructor(private prescriptionRepository: PrescriptionRepository) {}  

  async execute(prescriptionId: string, updateData: any): Promise<void> {
    try {
      if (!prescriptionId || prescriptionId.trim() === '') {
        throw new ValidationError("Prescription ID is required");
      }
  
      const exists = await this.prescriptionRepository.exists(prescriptionId);
      if (!exists) {
        throw new NotFoundError(`Prescription with ID ${prescriptionId} not found`);
      }
  
      await this.prescriptionRepository.updateById(prescriptionId, updateData);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Update prescription');
    }
  }
}
