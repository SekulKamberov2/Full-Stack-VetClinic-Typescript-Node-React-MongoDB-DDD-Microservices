import { PatientNote, PatientNoteProps, NoteType } from '../../domain/entities/PatientNote';
import { PatientNoteRepository } from '../../domain/repositories/PatientNoteRepository';
import { PatientNoteModel } from './models/PatientNoteModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoPatientNoteRepository implements PatientNoteRepository {
  private model: typeof PatientNoteModel;

  constructor() {
    this.model = PatientNoteModel;
  }

  async findById(id: string): Promise<PatientNote | null> {
    try {
      const noteDoc = await this.model.findById(id).exec();
      return noteDoc ? this.toEntity(noteDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByPatientId(patientId: string): Promise<PatientNote[]> {
    try {
      const noteDocs = await this.model.find({ patientId }).sort({ dateCreated: -1 }).exec();
      return noteDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByPatientId');
    }
  }

  async findByAuthorId(authorId: string): Promise<PatientNote[]> {
    try {
      const noteDocs = await this.model.find({ authorId }).sort({ dateCreated: -1 }).exec();
      return noteDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByAuthorId');
    }
  }

  async findByNoteType(noteType: string): Promise<PatientNote[]> {
    try {
      const noteDocs = await this.model.find({ noteType }).sort({ dateCreated: -1 }).exec();
      return noteDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByNoteType');
    }
  }

  async findAll(): Promise<PatientNote[]> {
    try {
      const noteDocs = await this.model.find().exec();
      return noteDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async findRecentNotes(limit: number = 10): Promise<PatientNote[]> {
    try {
      const noteDocs = await this.model.find()
        .sort({ dateCreated: -1 })
        .limit(limit)
        .exec();
      return noteDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findRecentNotes');
    }
  }

  async save(note: PatientNote): Promise<PatientNote> {
    try {
      if (!note.id || note.id === '') {
        const noteDoc = new this.model(this.toDocument(note));
        const savedDoc = await noteDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        note.id,
        this.toDocument(note),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Patient note with ID ${note.id} not found`,
          undefined,
          'PatientNoteRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(note: PatientNote): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        note.id,
        this.toDocument(note),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Patient note with ID ${note.id} not found`,
          undefined,
          'PatientNoteRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundError(
          `Patient note with ID ${id} not found`,
          undefined,
          'PatientNoteRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  private toEntity(doc: any): PatientNote {
    const props: PatientNoteProps = {
      id: doc._id.toString(),
      patientId: doc.patientId,
      weight: doc.weight,
      noteText: doc.noteText,
      authorId: doc.authorId,
      dateCreated: doc.dateCreated,
      noteType: doc.noteType as NoteType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return PatientNote.create(props);
  }

  private toDocument(note: PatientNote): Partial<any> {
    return {
      patientId: note.patientId,
      weight: note.weight,
      noteText: note.noteText,
      authorId: note.authorId,
      dateCreated: note.dateCreated,
      noteType: note.noteType,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoPatientNoteRepository.${operation}`;
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ValidationError(
        `Database validation failed: ${error.message}`,
        error,
        context
      );
    }
    
    if (error instanceof Error && error.name === 'CastError') {
      throw new ValidationError(
        'Invalid ID format',
        error,
        context
      );
    }
    
    throw new AppError(
      `Database operation failed: ${operation}`,
      'DATABASE_OPERATION_FAILED',
      error,
      context
    );
  }
}
