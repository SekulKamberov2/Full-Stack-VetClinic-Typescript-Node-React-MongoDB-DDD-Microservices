import { PatientNote } from '../entities/PatientNote';

export interface PatientNoteRepository {
  findById(id: string): Promise<PatientNote | null>;
  findByPatientId(patientId: string): Promise<PatientNote[]>;
  findByAuthorId(authorId: string): Promise<PatientNote[]>;
  findByNoteType(noteType: string): Promise<PatientNote[]>;
  findRecentNotes(limit?: number): Promise<PatientNote[]>; 
  findAll(): Promise<PatientNote[]>; 
  save(note: PatientNote): Promise<PatientNote>;
  update(note: PatientNote): Promise<void>;
  delete(id: string): Promise<void>;
}
