import { api, apii } from './authService';

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction: string;
  severity: string;
  firstObserved: string;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalAlert {
  id: string;
  patientId: string;
  alertText: string;
  severity: string;
  createdBy: string;
  dateCreated: string;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientNote {
  id: string;
  patientId: string;
  weight: number;
  noteText: string;
  authorId: string;
  dateCreated: string;
  noteType: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaccinationRecord {
  id: string;
  patientId: string;
  vaccineName: string;
  dateAdministered: string;
  nextDueDate: string;
  administeredBy: string;
  lotNumber: string;
  manufacturer: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  isDue: boolean;
  isOverdue: boolean;
}

export interface Visit {
  id: string;
  patientId: string;
  scheduledDateTime: string;
  status: string;
  type: string;
  chiefComplaint: string;
  assignedVeterinarianId: string;
  notes: string;
  diagnosis: string;
  treatment: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDetails {
  patient: {
    id: string;
    name: string;
    species: string;
    breed: string;
    dateOfBirth: string;
    microchipNumber: string;
    profilePictureUrl: string;
    ownerId: string;
    medicalAlerts: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  allergies: Allergy[];
  medicalAlerts: MedicalAlert[];
  patientNotes: PatientNote[];
  vaccinationRecords: VaccinationRecord[];
  visits: Visit[];
}

export interface PetHealthResponse {
  success: boolean;
  data: PatientDetails;
}

export const petHealthService = {
  getPetHealthDetails: async (ownerId: string, patientId: string): Promise<PetHealthResponse> => { 
    try {
      const response = await apii.get<PetHealthResponse>(`api/owners/${ownerId}/patients/${patientId}/details`);
       console.log('response', response.data)
      return response.data;
    } catch (error: any) {
      console.error('Pet health service - getPetHealthDetails error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pet health details');
    }
  }
};
