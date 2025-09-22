export type Role = 'admin' | 'vet' | 'staff' | 'client';

export interface User {
  _id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
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
}
