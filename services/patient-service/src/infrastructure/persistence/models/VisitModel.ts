import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitDocument extends Document {
  patientId: string;
  scheduledDateTime: Date;
  actualDateTime?: Date;
  status: string;
  type: string;
  chiefComplaint: string;
  assignedVeterinarianId: string;
  checkinTime?: Date;
  checkoutTime?: Date;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema<IVisitDocument>(
  {
    patientId: { type: String, required: true, index: true },
    scheduledDateTime: { type: Date, required: true },
    actualDateTime: { type: Date },
    status: { 
      type: String, 
      required: true, 
      enum: ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    type: { 
      type: String, 
      required: true,
      enum: ['wellness', 'emergency', 'follow-up', 'surgery', 'vaccination', 'dental', 'grooming']
    },
    chiefComplaint: { type: String, required: true },
    assignedVeterinarianId: { type: String, required: true },
    checkinTime: { type: Date },
    checkoutTime: { type: Date },
    notes: { type: String },
    diagnosis: { type: String },
    treatment: { type: String },
  },
  {
    timestamps: true,
  }
);

VisitSchema.index({ patientId: 1 });
VisitSchema.index({ assignedVeterinarianId: 1 });
VisitSchema.index({ status: 1 });
VisitSchema.index({ scheduledDateTime: 1 });
VisitSchema.index({ patientId: 1, scheduledDateTime: 1 });
VisitSchema.index({ type: 1 });

export const VisitModel = mongoose.model<IVisitDocument>('Visit', VisitSchema);
