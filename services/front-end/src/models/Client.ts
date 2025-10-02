import { Award } from './Award';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  role: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    _id?: string;
  };
  pets?: Array<{
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    dateOfBirth: string;
    weight: number;
    color: string;
    gender: 'Male' | 'Female';
    profileImage: string | null;
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
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}
