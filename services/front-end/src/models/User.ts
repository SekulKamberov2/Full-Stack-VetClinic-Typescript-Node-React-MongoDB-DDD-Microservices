export type Role = 'admin' | 'vet' | 'staff' | 'client';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  address?: Address;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
}

export interface LoginData {
  email: string;
  password: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  phone?: string;
  address?: Address;
}