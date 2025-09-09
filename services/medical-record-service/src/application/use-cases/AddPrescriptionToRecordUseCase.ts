import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
import { Prescription, PrescriptionProps } from "../../domain/entities/Prescription";
import { ErrorHandler, NotFoundError, ValidationError } from "@vetclinic/shared-kernel"; 

export class AddPrescriptionToRecordUseCase {
  constructor(
    private medicalRecordRepository: MedicalRecordRepository,
    private prescriptionRepository: PrescriptionRepository
  ) {}

  async execute(
    recordId: string,
    medicationName: string,
    dosage: string,
    instructions: string,
    refills: number,
    datePrescribed?: Date,
    status: string = 'pending'
  ): Promise<Prescription> {  
    try {
      if (!recordId || recordId.trim() === '') {
        throw new ValidationError("Record ID is required");
      }
      if (!medicationName || medicationName.trim() === '') {
        throw new ValidationError("Medication name is required");
      }
      if (!dosage || dosage.trim() === '') {
        throw new ValidationError("Dosage is required");
      }
      if (refills === undefined || refills === null || refills < 0) {
        throw new ValidationError("Valid refills count is required");
      }
  
      const validStatuses = ['pending', 'processing', 'filled', 'cancelled', 'completed'];
      if (status && !validStatuses.includes(status)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
  
      const record = await this.medicalRecordRepository.findById(recordId);
      if (!record) {
        throw new NotFoundError(`Medical record with ID ${recordId} not found`);
      }

      const finalDatePrescribed = datePrescribed || new Date();

      const prescriptionProps: PrescriptionProps = {  
        recordId,
        medicationName: medicationName.trim(),
        dosage: dosage.trim(),
        instructions: instructions ? instructions.trim() : "",
        datePrescribed: finalDatePrescribed,
        refills,
        status: status as 'pending' | 'filled'
      };
  
      const prescription = Prescription.create(prescriptionProps);
      
      const savedPrescription = await this.prescriptionRepository.save(prescription);
      console.log('Successfully saved prescription:', savedPrescription.id);
      return savedPrescription;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Add prescription to record');
    }
  }
}
