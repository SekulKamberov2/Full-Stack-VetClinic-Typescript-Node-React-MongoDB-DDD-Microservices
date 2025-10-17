import { Patient, PatientStatus } from '../../../domain/entities/Patient';
import { PatientRepository } from '../../../domain/repositories/PatientRepository';
import { ValidationError, NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdatePatientUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(id: string, patientData: Partial<{
    name: string;
    species: string;
    breed: string;
    dateOfBirth: Date;
    color: string;
    sex: string;
    microchipNumber?: string;
    profilePictureUrl?: string;
    status: PatientStatus;
    medicalAlerts: string[];
  }>): Promise<Patient> {
    try {
      this.validatePatientData(patientData);
      
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        throw new NotFoundError(
          `Patient with ID ${id} not found`,
          undefined,
          'UpdatePatientUseCase'
        );
      }

      if (patientData.microchipNumber && patientData.microchipNumber !== existingPatient.microchipNumber) {
        const patientWithMicrochip = await this.patientRepository.findByMicrochip(patientData.microchipNumber);
        if (patientWithMicrochip && patientWithMicrochip.id !== id) {
          throw new ValidationError(
            `Patient with microchip number ${patientData.microchipNumber} already exists`,
            undefined,
            'UpdatePatientUseCase' 
          );
        }
      }

      const updatedPatient = existingPatient.update(patientData);
      await this.patientRepository.update(updatedPatient);
      return updatedPatient;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update patient') as never;
    }
  }

  private validatePatientData(patientData: any): void {
    const context = 'UpdatePatientUseCase';

    if (patientData.name !== undefined && (!patientData.name || patientData.name.trim() === '')) {
      throw new ValidationError("Patient name cannot be empty", undefined, context);
    }

    if (patientData.species !== undefined && (!patientData.species || patientData.species.trim() === '')) {
      throw new ValidationError("Species cannot be empty", undefined, context);
    }

    if (patientData.breed !== undefined && (!patientData.breed || patientData.breed.trim() === '')) {
      throw new ValidationError("Breed cannot be empty", undefined, context);
    }

    if (patientData.color !== undefined && (!patientData.color || patientData.color.trim() === '')) {
      throw new ValidationError("Color cannot be empty", undefined, context);
    }

    if (patientData.sex !== undefined && (!patientData.sex || patientData.sex.trim() === '')) {
      throw new ValidationError("Sex cannot be empty", undefined, context);
    }

    if (patientData.dateOfBirth !== undefined) {
      if (!(patientData.dateOfBirth instanceof Date)) {
        throw new ValidationError("Date of birth must be a valid date", undefined, context);
      }
      
      if (patientData.dateOfBirth > new Date()) {
        throw new ValidationError("Date of birth cannot be in the future", undefined, context);
      }
    }

    if (patientData.status !== undefined) {
      const validStatuses = Object.values(PatientStatus);
      if (!validStatuses.includes(patientData.status)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, undefined, context);
      }
    }

    if (patientData.medicalAlerts !== undefined && !Array.isArray(patientData.medicalAlerts)) {
      throw new ValidationError("Medical alerts must be an array", undefined, context);
    }
  }
}
