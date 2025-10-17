import { Patient, PatientProps, PatientStatus } from '../../../domain/entities/Patient';
import { PatientRepository } from '../../../domain/repositories/PatientRepository';
import { ValidationError, DuplicateError, ErrorHandler } from "@vetclinic/shared-kernel";

interface CreatePatientResult {
  patient: Patient;
  wasExisting: boolean;
}

export class CreatePatientUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(patientData: Omit<PatientProps, 'createdAt' | 'updatedAt'>): Promise<CreatePatientResult> {
    try { 
      const processedData = {
        ...patientData,
        dateOfBirth: this.parseDate(patientData.dateOfBirth)
      };

      this.validatePatientData(processedData);
      
      if (processedData.id) {
        const existingPatient = await this.patientRepository.findById(processedData.id);
        if (existingPatient) {
          return { patient: existingPatient, wasExisting: true };
        }
      }
       
      const exists = await this.patientRepository.existsByNameAndOwner(processedData.name, processedData.ownerId);
      if (exists) {
        throw new DuplicateError(
          `Patient with name ${processedData.name} already exists for this owner`,
          undefined,
          'CreatePatientUseCase',
          'name'
        );
      }

      if (processedData.microchipNumber) {
        const patientWithMicrochip = await this.patientRepository.findByMicrochip(processedData.microchipNumber);
        if (patientWithMicrochip) {
          throw new DuplicateError(
            `Patient with microchip number ${processedData.microchipNumber} already exists`,
            undefined,
            'CreatePatientUseCase',
            'microchipNumber'
          );
        }
      }

      const patient = Patient.create({
        ...processedData,
        status: processedData.status || PatientStatus.ACTIVE,
        isActive: processedData.isActive ?? true,
        medicalAlerts: processedData.medicalAlerts || []
      });

      const savedPatient = await this.patientRepository.save(patient);
      return { patient: savedPatient, wasExisting: false };
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Create patient') as never;
    }
  }

  private parseDate(dateInput: any): Date {
    if (dateInput instanceof Date) {
      return dateInput;
    }
    
    if (typeof dateInput === 'string' || typeof dateInput === 'number') {
      const parsedDate = new Date(dateInput);
      if (isNaN(parsedDate.getTime())) {
        throw new ValidationError("Invalid date format", undefined, 'CreatePatientUseCase');
      }
      return parsedDate;
    }
    
    throw new ValidationError("Date of birth must be a valid date", undefined, 'CreatePatientUseCase');
  }

  private validatePatientData(patientData: any): void {
    const context = 'CreatePatientUseCase';

    if (!patientData.name || patientData.name.trim() === '') {
      throw new ValidationError("Patient name is required", undefined, context);
    }

    if (!patientData.species || patientData.species.trim() === '') {
      throw new ValidationError("Species is required", undefined, context);
    }

    if (!patientData.breed || patientData.breed.trim() === '') {
      throw new ValidationError("Breed is required", undefined, context);
    }

    if (!patientData.color || patientData.color.trim() === '') {
      throw new ValidationError("Color is required", undefined, context);
    }

    if (!patientData.sex || patientData.sex.trim() === '') {
      throw new ValidationError("Sex is required", undefined, context);
    }

    if (!patientData.dateOfBirth) {
      throw new ValidationError("Date of birth is required", undefined, context);
    }

    if (patientData.dateOfBirth > new Date()) {
      throw new ValidationError("Date of birth cannot be in the future", undefined, context);
    }

    if (!patientData.ownerId || patientData.ownerId.trim() === '') {
      throw new ValidationError("Owner ID is required", undefined, context);
    }

    if (patientData.status) {
      const validStatuses = ['active', 'deceased', 'transferred'];
      if (!validStatuses.includes(patientData.status)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, undefined, context);
      }
    }
  }
}
