import mongoose, { Schema, Document } from 'mongoose';

export interface DiagnosisDocument extends Document {
  recordId: string;
  description: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const diagnosisSchema = new Schema<DiagnosisDocument>({
  recordId: { type: String, required: true, index: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String },
}, { timestamps: true });
 
diagnosisSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; }
});

export const DiagnosisModel = mongoose.model<DiagnosisDocument>('Diagnosis', diagnosisSchema);
