import { ErrorHandler, NotFoundError, ValidationError } from "@vetclinic/shared-kernel";
import { Prescription } from "../../domain/entities/Prescription";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";  

export class GetPrescriptionByIdUseCase {
  constructor(private prescriptionRepository: PrescriptionRepository) {}  

  async execute(prescriptionId: string): Promise<Prescription> {
    try {
      if (!prescriptionId || prescriptionId.trim() === '') {
        throw new ValidationError("Prescription ID is required");
      }

      const prescription = await this.prescriptionRepository.findById(prescriptionId);
      
      if (!prescription) {
        throw new NotFoundError(`Prescription with ID ${prescriptionId} not found`);
      }

      return prescription;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Get prescription by ID');
    }
  }
}
