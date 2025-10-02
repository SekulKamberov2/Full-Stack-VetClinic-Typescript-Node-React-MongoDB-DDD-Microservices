import mongoose, { Schema, Document } from 'mongoose';

export interface IAwardDocument extends Document {
  title: string;
  description: string;
  category: string;
  level: string;
  dateAwarded: Date;
  points: number;
  imageUrl?: string;
  criteria: string;
  petId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  awardedBy: string;
  isValid: boolean;
  expirationDate?: Date;
  metadata?: {
    competitionName?: string;
    score?: number;
    rank?: number;
    location?: string;
    judges?: string[];
    certificateNumber?: string;
    specialNotes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AwardSchema = new Schema<IAwardDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    dateAwarded: { type: Date, required: true },
    points: { type: Number, required: true },
    imageUrl: { type: String },
    criteria: { type: String, required: true },
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    awardedBy: { type: String, required: true },
    isValid: { type: Boolean, default: true },
    expirationDate: { type: Date },
    metadata: {
      competitionName: { type: String },
      score: { type: Number },
      rank: { type: Number },
      location: { type: String },
      judges: [{ type: String }],
      certificateNumber: { type: String },
      specialNotes: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const AwardModel = mongoose.model<IAwardDocument>('Award', AwardSchema);
