import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalAlertDocument extends Document {
  patientId: string;
  alertText: string;
  severity: string;
  createdBy: string;
  dateCreated: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalAlertSchema = new Schema<IMedicalAlertDocument>(
  {
    patientId: { type: String, required: true, index: true },
    alertText: { type: String, required: true },
    severity: { 
      type: String, 
      required: true, 
      enum: ['low', 'medium', 'high', 'critical']
    },
    createdBy: { type: String, required: true },
    dateCreated: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

MedicalAlertSchema.index({ patientId: 1 });
MedicalAlertSchema.index({ isActive: 1 });
MedicalAlertSchema.index({ severity: 1 });
MedicalAlertSchema.index({ patientId: 1, isActive: 1 });

export const MedicalAlertModel = mongoose.model<IMedicalAlertDocument>('MedicalAlert', MedicalAlertSchema);
