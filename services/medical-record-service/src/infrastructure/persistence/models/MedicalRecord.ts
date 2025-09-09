import mongoose, { Schema, Document } from 'mongoose';

export interface MedicalRecordDocument extends Document {
  patientId: string;
  clientId: string;
  veterinarianId: string;
  appointmentId?: string;
  notes?: string;
  diagnoses: mongoose.Types.ObjectId[];   
  treatments: mongoose.Types.ObjectId[];   
  prescriptions: mongoose.Types.ObjectId[];  
  createdAt: Date;
  updatedAt: Date;
}

const medicalRecordSchema = new Schema<MedicalRecordDocument>({
  patientId: { type: String, required: true, index: true },
  clientId: { type: String, required: true, index: true },
  veterinarianId: { type: String, required: true, index: true },
  appointmentId: { type: String, index: true },
  notes: { type: String },
  diagnoses: [{ type: Schema.Types.ObjectId, ref: 'Diagnosis' }],   
  treatments: [{ type: Schema.Types.ObjectId, ref: 'Treatment' }],   
  prescriptions: [{ type: Schema.Types.ObjectId, ref: 'Prescription' }],  
}, { timestamps: true });

export const MedicalRecordModel = mongoose.model<MedicalRecordDocument>('MedicalRecord', medicalRecordSchema);
