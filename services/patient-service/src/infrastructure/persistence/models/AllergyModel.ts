import mongoose, { Schema, Document } from 'mongoose';

export interface IAllergyDocument extends Document {
  patientId: string;
  allergen: string;
  reaction: string;
  severity: string;
  firstObserved: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AllergySchema = new Schema<IAllergyDocument>(
  {
    patientId: { type: String, required: true, index: true },
    allergen: { type: String, required: true },
    reaction: { type: String, required: true },
    severity: { 
      type: String, 
      required: true, 
      enum: ['mild', 'moderate', 'severe']
    },
    firstObserved: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

AllergySchema.index({ patientId: 1 });
AllergySchema.index({ isActive: 1 });
AllergySchema.index({ severity: 1 });
AllergySchema.index({ allergen: 1 });

export const AllergyModel = mongoose.model<IAllergyDocument>('Allergy', AllergySchema);
