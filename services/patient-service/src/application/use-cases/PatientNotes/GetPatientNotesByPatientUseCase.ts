import { PatientNote } from '../../../domain/entities/PatientNote';
import { PatientNoteRepository } from '../../../domain/repositories/PatientNoteRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetPatientNotesByPatientUseCase {
  constructor(private patientNoteRepository: PatientNoteRepository) {}

  async execute(patientId: string): Promise<PatientNote[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new ValidationError("Patient ID is required", undefined, 'GetPatientNotesByPatientUseCase');
      }

      return await this.patientNoteRepository.findByPatientId(patientId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get patient notes by patient') as never;
    }
  }
}
