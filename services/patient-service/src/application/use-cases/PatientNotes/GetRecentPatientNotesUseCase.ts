import { PatientNote } from '../../../domain/entities/PatientNote';
import { PatientNoteRepository } from '../../../domain/repositories/PatientNoteRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetRecentPatientNotesUseCase {
  constructor(private patientNoteRepository: PatientNoteRepository) {}

  async execute(limit: number = 10): Promise<PatientNote[]> {
    try {
      if (limit <= 0) {
        throw new ValidationError("Limit must be a positive number", undefined, 'GetRecentPatientNotesUseCase');
      }

      if (limit > 100) {
        throw new ValidationError("Limit cannot exceed 100", undefined, 'GetRecentPatientNotesUseCase');
      }

      return await this.patientNoteRepository.findRecentNotes(limit);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get recent patient notes') as never;
    }
  }
}
