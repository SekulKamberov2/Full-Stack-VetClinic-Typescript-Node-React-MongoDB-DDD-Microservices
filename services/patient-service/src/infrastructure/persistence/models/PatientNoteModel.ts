import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientNoteDocument extends Document {
  patientId: string;
  weight: number;
  noteText: string;
  authorId: string;
  dateCreated: Date;
  noteType: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientNoteSchema = new Schema<IPatientNoteDocument>(
  {
    patientId: { type: String, required: true, index: true },
    weight: { type: Number, required: true, min: 0 },
    noteText: { type: String, required: true },
    authorId: { type: String, required: true },
    dateCreated: { type: Date, required: true },
    noteType: { 
      type: String, 
      required: true, 
      enum: ['general', 'behavioral', 'dietary', 'owner_instructions', 'medical', 'follow_up']
    },
  },
  {
    timestamps: true,
  }
);

PatientNoteSchema.index({ patientId: 1 });
PatientNoteSchema.index({ authorId: 1 });
PatientNoteSchema.index({ noteType: 1 });
PatientNoteSchema.index({ dateCreated: -1 });
PatientNoteSchema.index({ patientId: 1, dateCreated: -1 });

export const PatientNoteModel = mongoose.model<IPatientNoteDocument>('PatientNote', PatientNoteSchema);
