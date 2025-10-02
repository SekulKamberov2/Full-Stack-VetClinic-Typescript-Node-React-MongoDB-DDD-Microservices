import mongoose, { Schema, Document } from 'mongoose';

export interface IPetDocument extends Document {
  name: string;
  species: string;
  breed: string;
  age: number;
  dateOfBirth: Date;
  weight: number;
  color: string;
  gender: 'Male' | 'Female';
  profileImage?: string;
  microchipNumber?: string;
  insuranceNumber?: string;
  dietaryRestrictions: string[];
  vaccinationRecords: VaccinationRecordDocument[];
  awards: any[];
  isActive: boolean;
  clientId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface VaccinationRecordDocument {
  vaccineId: string;
  vaccine: string;
  dateAdministered: Date;
  nextDueDate: Date;
  veterinarian: string;
  lotNumber?: string;
  isCompleted: boolean;
}

const VaccinationRecordSchema = new Schema({
  vaccineId: { type: String, required: true },
  vaccine: { type: String, required: true },
  dateAdministered: { type: Date, required: true },
  nextDueDate: { type: Date, required: true },
  veterinarian: { type: String, required: true },
  lotNumber: { type: String },
  isCompleted: { type: Boolean, default: false },
});

const PetSchema = new Schema<IPetDocument>(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    dateOfBirth: { type: Date, required: true },
    weight: { type: Number, required: true },
    color: { type: String, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female'] },
    profileImage: { 
      type: String,
      default: null 
    },
    microchipNumber: { type: String },
    insuranceNumber: { type: String },
    dietaryRestrictions: [{ type: String }],
    vaccinationRecords: [VaccinationRecordSchema],
    awards: [{ type: Schema.Types.Mixed }],
    isActive: { type: Boolean, default: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  },
  {
    timestamps: true,
  }
);

export const PetModel = mongoose.model<IPetDocument>('Pet', PetSchema);
