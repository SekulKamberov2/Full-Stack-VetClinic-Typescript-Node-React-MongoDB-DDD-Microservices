import { ErrorHandler, ValidationError } from "@vetclinic/shared-kernel";
import { Prescription } from "../../domain/entities/Prescription";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository"; 

export class GetPrescriptionsByRecordUseCase {
  constructor(private prescriptionRepository: PrescriptionRepository) {}  

  async execute(recordId: string): Promise<Prescription[]> {
    try {
      if (!recordId || recordId.trim() === '') {
        throw new ValidationError("Record ID is required");
      }

      return await this.prescriptionRepository.findByRecordId(recordId);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Get prescriptions by record');
    }
  }
}
