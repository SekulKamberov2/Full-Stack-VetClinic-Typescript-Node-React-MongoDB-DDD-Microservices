import { PatientNote } from '../../../domain/entities/PatientNote';
import { PatientNoteRepository } from '../../../domain/repositories/PatientNoteRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllPatientNotesUseCase {
  constructor(private patientNoteRepository: PatientNoteRepository) {}

  async execute(): Promise<PatientNote[]> {
    try {
      return await this.patientNoteRepository.findAll();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get all patient notes') as never;
    }
  }
}
