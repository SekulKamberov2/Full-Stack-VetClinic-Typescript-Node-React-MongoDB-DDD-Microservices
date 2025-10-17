import { PatientNoteRepository } from '../../../domain/repositories/PatientNoteRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class DeletePatientNoteUseCase {
  constructor(private patientNoteRepository: PatientNoteRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const existingNote = await this.patientNoteRepository.findById(id);
      if (!existingNote) {
        throw new NotFoundError(
          `Patient note with ID ${id} not found`,
          undefined,
          'DeletePatientNoteUseCase'
        );
      }

      await this.patientNoteRepository.delete(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Delete patient note') as never;
    }
  }
}
