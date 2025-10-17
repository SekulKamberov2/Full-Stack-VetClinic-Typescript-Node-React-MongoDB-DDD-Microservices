import { PatientNote } from '../../../domain/entities/PatientNote';
import { PatientNoteRepository } from '../../../domain/repositories/PatientNoteRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetPatientNoteUseCase {
  constructor(private patientNoteRepository: PatientNoteRepository) {}

  async execute(id: string): Promise<PatientNote | null> {
    try {
      return await this.patientNoteRepository.findById(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get patient note') as never;
    }
  }
}
