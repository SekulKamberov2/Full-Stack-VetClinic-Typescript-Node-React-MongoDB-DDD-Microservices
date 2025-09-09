import mongoose, { Schema, Document } from 'mongoose';

export interface TreatmentDocument extends Document {
  recordId: string;
  name: string;
  description: string;
  date: Date;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

const treatmentSchema = new Schema<TreatmentDocument>({
  recordId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  cost: { type: Number, required: true },
}, { timestamps: true });

treatmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; }
});

export const TreatmentModel = mongoose.model<TreatmentDocument>('Treatment', treatmentSchema);
