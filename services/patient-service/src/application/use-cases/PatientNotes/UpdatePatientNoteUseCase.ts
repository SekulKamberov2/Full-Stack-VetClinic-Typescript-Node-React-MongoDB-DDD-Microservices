import { PatientNote, NoteType } from '../../../domain/entities/PatientNote';
import { PatientNoteRepository } from '../../../domain/repositories/PatientNoteRepository';
import { ValidationError, NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdatePatientNoteUseCase {
  constructor(private patientNoteRepository: PatientNoteRepository) {}

  async execute(id: string, noteData: Partial<{
    weight: number;
    noteText: string;
    noteType: NoteType;
  }>): Promise<PatientNote> {
    try {
      this.validatePatientNoteData(noteData);
      
      const existingNote = await this.patientNoteRepository.findById(id);
      if (!existingNote) {
        throw new NotFoundError(
          `Patient note with ID ${id} not found`,
          undefined,
          'UpdatePatientNoteUseCase'
        );
      }

      const updatedNote = existingNote.update(noteData);
      await this.patientNoteRepository.update(updatedNote);
      return updatedNote;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update patient note') as never;
    }
  }

  private validatePatientNoteData(noteData: any): void {
    const context = 'UpdatePatientNoteUseCase';

    if (noteData.weight !== undefined) {
      if (noteData.weight < 0) {
        throw new ValidationError("Weight cannot be negative", undefined, context);
      }

      if (noteData.weight > 1000) {
        throw new ValidationError("Weight must be reasonable (less than 1000)", undefined, context);
      }
    }

    if (noteData.noteText !== undefined && (!noteData.noteText || noteData.noteText.trim() === '')) {
      throw new ValidationError("Note text cannot be empty", undefined, context);
    }

    if (noteData.noteType !== undefined) {
      const validNoteTypes = Object.values(NoteType);
      if (!validNoteTypes.includes(noteData.noteType)) {
        throw new ValidationError(
          `Invalid note type. Must be one of: ${validNoteTypes.join(', ')}`,
          undefined,
          context
        );
      }
    }
  }
}
