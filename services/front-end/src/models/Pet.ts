export interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  dateOfBirth: string;
  weight: number;
  color: string;
  gender: 'Male' | 'Female';
  microchipNumber?: string;
  insuranceNumber?: string;
  medicalHistory: any[];
  dietaryRestrictions: string[];
  vaccinationRecords: any[];
  awards: Award[];
  isActive: boolean;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Award {
  _id: string;
  name: string;
  category: string;
  points: number;
  description: string;
  dateAwarded: string;
  petId: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}