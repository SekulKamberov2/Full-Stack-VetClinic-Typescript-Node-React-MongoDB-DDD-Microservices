import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";  
import { Diagnosis } from "../../domain/entities/Diagnosis";
import { Treatment } from "../../domain/entities/Treatment";
import { Prescription } from "../../domain/entities/Prescription";
import { MedicalRecord } from "../../domain/entities/MedicalRecord";
import { ErrorHandler, NotFoundError } from "@vetclinic/shared-kernel";

export class UpdateMedicalRecordUseCase {
  constructor(private medicalRecordRepository: MedicalRecordRepository) {}

  async execute(recordId: string, updateData: {
    notes?: string;
    diagnoses?: Diagnosis[];
    treatments?: Treatment[];
    prescriptions?: Prescription[];
  }): Promise<void> {
    try {
      const record = await this.medicalRecordRepository.findById(recordId);
      
      if (!record) {
        throw new NotFoundError(`Medical record with ID ${recordId} not found`);
      }
  
      let updatedRecord = record;
      
      if (updateData.notes !== undefined) {
        updatedRecord = updatedRecord.updateNotes(updateData.notes);
      }

      if (updateData.diagnoses !== undefined) { 
        updatedRecord = new MedicalRecord({
          ...updatedRecord.toProps(),
          diagnoses: updateData.diagnoses,
          updatedAt: new Date(),
        });
      }

      if (updateData.treatments !== undefined) { 
        updatedRecord = new MedicalRecord({
          ...updatedRecord.toProps(),
          treatments: updateData.treatments,
          updatedAt: new Date(),
        });
      }

      if (updateData.prescriptions !== undefined) { 
        updatedRecord = new MedicalRecord({
          ...updatedRecord.toProps(),
          prescriptions: updateData.prescriptions,
          updatedAt: new Date(),
        });
      }

      await this.medicalRecordRepository.save(updatedRecord);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Update medical record');
    }
  }
}
