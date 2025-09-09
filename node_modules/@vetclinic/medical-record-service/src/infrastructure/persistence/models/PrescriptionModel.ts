import mongoose, { Schema, Document } from 'mongoose';

export interface PrescriptionDocument extends Document {
  recordId: string;
  medicationName: string;
  dosage: string;
  instructions?: string;
  datePrescribed: Date;
  refills: number;
  filledDate?: Date;
  filledBy?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<PrescriptionDocument>({
  recordId: { type: String, required: true, index: true },
  medicationName: { type: String, required: true },
  dosage: { type: String, required: true },
  instructions: { type: String },
  datePrescribed: { type: Date, required: true },
  refills: { type: Number, default: 0 },
  filledDate: { type: Date },
  filledBy: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'filled', 'cancelled', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

prescriptionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; }
});

export const PrescriptionModel = mongoose.model<PrescriptionDocument>('Prescription', prescriptionSchema);
