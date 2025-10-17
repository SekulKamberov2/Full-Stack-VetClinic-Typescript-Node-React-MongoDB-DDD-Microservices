import mongoose, { Schema, Document } from 'mongoose';

export interface IVaccinationRecordDocument extends Document {
  patientId: string;
  vaccineName: string;
  dateAdministered: Date;
  nextDueDate: Date;
  administeredBy: string;
  lotNumber?: string;
  manufacturer?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaccinationRecordSchema = new Schema<IVaccinationRecordDocument>(
  {
    patientId: { type: String, required: true, index: true },
    vaccineName: { 
      type: String, 
      required: true,
      enum: [
        'Rabies', 'Distemper', 'Parvovirus', 'Adenovirus', 'Parainfluenza',
        'Bordetella', 'Leptospirosis', 'Lyme', 'Influenza', 'FVRCP',
        'Feline Leukemia', 'FIV', 'Other'
      ]
    },
    dateAdministered: { type: Date, required: true },
    nextDueDate: { type: Date, required: true },
    administeredBy: { type: String, required: true },
    lotNumber: { type: String },
    manufacturer: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

VaccinationRecordSchema.index({ patientId: 1 });
VaccinationRecordSchema.index({ nextDueDate: 1 });
VaccinationRecordSchema.index({ vaccineName: 1 });
VaccinationRecordSchema.index({ patientId: 1, vaccineName: 1 });

export const VaccinationRecordModel = mongoose.model<IVaccinationRecordDocument>('VaccinationRecord', VaccinationRecordSchema);
