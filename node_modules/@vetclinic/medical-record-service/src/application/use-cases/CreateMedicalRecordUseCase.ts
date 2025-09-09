import { MedicalRecord } from "../../domain/entities/MedicalRecord";
import { Diagnosis } from "../../domain/entities/Diagnosis";
import { Treatment } from "../../domain/entities/Treatment";
import { Prescription } from "../../domain/entities/Prescription";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
import { DuplicateError, ErrorHandler, ValidationError } from "@vetclinic/shared-kernel"; 

export interface CreateMedicalRecordRequest {
  patientId: string;
  clientId: string;
  veterinarianId: string;
  appointmentId?: string;
  notes?: string;
  diagnoses?: Array<{
    description: string;
    date?: Date;
    notes?: string;
  }>;
  treatments?: Array<{
    name: string;
    description: string;
    date?: Date;
    cost: number;
  }>;
  prescriptions?: Array<{
    medicationName: string;
    dosage: string;
    instructions: string;
    datePrescribed?: Date;
    refills: number;
    filledDate?: Date;
    filledBy?: string;
    status?: 'pending' | 'filled';
  }>;
}

export class CreateMedicalRecordUseCase {
  constructor(private medicalRecordRepository: MedicalRecordRepository) {}

  async execute(request: CreateMedicalRecordRequest): Promise<MedicalRecord> {
    try {
      const { 
        patientId, 
        clientId, 
        veterinarianId, 
        appointmentId, 
        notes, 
        diagnoses, 
        treatments, 
        prescriptions 
      } = request;
  
      if (!patientId || !clientId || !veterinarianId) {
        throw new ValidationError("Missing required fields: patient ID, client ID, and veterinarian ID are required");
      }
  
      if (appointmentId) {
        const existingRecord = await this.medicalRecordRepository.findByAppointmentId(appointmentId);
        if (existingRecord) {
          throw new DuplicateError(`Medical record already exists for appointment ${appointmentId}`);
        }
      }
  
      const diagnosisEntities = diagnoses?.map(diagnosisData => 
        Diagnosis.create({
          recordId: "", 
          description: diagnosisData.description,
          date: diagnosisData.date || new Date(),
          notes: diagnosisData.notes,
        })
      ) || [];

      const treatmentEntities = treatments?.map(treatmentData => 
        Treatment.create({
          recordId: "",  
          name: treatmentData.name,
          description: treatmentData.description,
          date: treatmentData.date || new Date(),
          cost: treatmentData.cost,
        })
      ) || [];

      const prescriptionEntities = prescriptions?.map(prescriptionData => 
        Prescription.create({
          recordId: "",  
          medicationName: prescriptionData.medicationName,
          dosage: prescriptionData.dosage,
          instructions: prescriptionData.instructions,
          datePrescribed: prescriptionData.datePrescribed || new Date(),
          refills: prescriptionData.refills,
          filledDate: prescriptionData.filledDate,
          filledBy: prescriptionData.filledBy,
          status: prescriptionData.status || 'pending',
        })
      ) || [];
  
      const medicalRecord = MedicalRecord.create({
        patientId,
        clientId,
        veterinarianId,
        appointmentId,
        notes,
        diagnoses: diagnosisEntities,
        treatments: treatmentEntities,
        prescriptions: prescriptionEntities,
      }); 

      return await this.medicalRecordRepository.save(medicalRecord);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Create medical record');
    }
  }
}
