import { PatientNote, PatientNoteProps, NoteType } from '../../../domain/entities/PatientNote';
import { PatientNoteRepository } from '../../../domain/repositories/PatientNoteRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class CreatePatientNoteUseCase {
  constructor(private patientNoteRepository: PatientNoteRepository) {}

  async execute(patientNoteData: Omit<PatientNoteProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientNote> {
    try {
      this.validatePatientNoteData(patientNoteData);

      const patientNote = PatientNote.create({
        ...patientNoteData,
        dateCreated: patientNoteData.dateCreated || new Date()
      });

      return await this.patientNoteRepository.save(patientNote);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Create patient note') as never;
    }
  }

  private validatePatientNoteData(patientNoteData: any): void {
    const context = 'CreatePatientNoteUseCase';

    if (!patientNoteData.patientId || patientNoteData.patientId.trim() === '') {
      throw new ValidationError("Patient ID is required", undefined, context);
    }

    if (!patientNoteData.noteText || patientNoteData.noteText.trim() === '') {
      throw new ValidationError("Note text is required", undefined, context);
    }

    if (!patientNoteData.authorId || patientNoteData.authorId.trim() === '') {
      throw new ValidationError("Author ID is required", undefined, context);
    }

    if (patientNoteData.weight === undefined || patientNoteData.weight === null) {
      throw new ValidationError("Weight is required", undefined, context);
    }

    if (patientNoteData.weight < 0) {
      throw new ValidationError("Weight cannot be negative", undefined, context);
    }

    if (patientNoteData.weight > 1000) {
      throw new ValidationError("Weight must be reasonable (less than 1000)", undefined, context);
    }

    if (!patientNoteData.noteType) {
      throw new ValidationError("Note type is required", undefined, context);
    }

    const validNoteTypes = Object.values(NoteType);
    if (!validNoteTypes.includes(patientNoteData.noteType)) {
      throw new ValidationError(
        `Invalid note type. Must be one of: ${validNoteTypes.join(', ')}`,
        undefined,
        context
      );
    }

    if (patientNoteData.dateCreated && patientNoteData.dateCreated > new Date()) {
      throw new ValidationError("Date created cannot be in the future", undefined, context);
    }
  }
}
