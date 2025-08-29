import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientDocument extends Document {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  medicalAlerts: string[];
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatientDocument>(
  {
    name: { type: String, required: true, trim: true },
    species: { type: String, required: true, trim: true },
    breed: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    medicalAlerts: [{ type: String, trim: true }],
    ownerId: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

PatientSchema.index({ ownerId: 1 });
PatientSchema.index({ isActive: 1 });

export const PatientModel = mongoose.model<IPatientDocument>('Patient', PatientSchema);