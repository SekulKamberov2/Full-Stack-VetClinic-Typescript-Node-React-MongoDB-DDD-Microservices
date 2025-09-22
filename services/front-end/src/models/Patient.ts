export interface Patient {
  _id: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  medicalAlerts: [];
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string; 
  firstName: string;
  lastName: string;
}
 

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string; 
}
