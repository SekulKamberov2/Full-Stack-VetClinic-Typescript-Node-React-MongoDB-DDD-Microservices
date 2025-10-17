import { apii } from './authService';

export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  color: string;
  gender: string;
  microchipNumber: string;
  ownerId: string;
  medicalAlerts: string[];
  status: string;
}

export interface MedicalAlert {
  patientId: string;
  alertText: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export interface Vaccination {
  patientId: string;
  vaccineName: string;
  dateAdministered: string;
  nextDueDate: string;
  administeredBy: string;
  lotNumber?: string;
  manufacturer?: string;
  notes?: string;
}

export interface PatientNote {
  patientId: string;
  weight: number;
  noteText: string;
  noteType: 'general' | 'medical' | 'behavioral';
}

export interface PatientsResponse {
  success: boolean;
  data: Patient[];
}

export const patientsService = {
  createPatient: async (patientData: Omit<Patient, 'id'> & { id?: string }): Promise<Patient> => {
    try {
      const response = await apii.post<{ success: boolean; data: Patient }>('/api/patients', patientData);
      return response.data.data;
    } catch (error: any) {
      console.error('patientsService - createPatient error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create patient');
    }
  },

  createMedicalAlert: async (alertData: MedicalAlert): Promise<any> => {
    try {
      const response = await apii.post('/api/medical-alerts', alertData);
      return response.data;
    } catch (error: any) {
      console.error('patientsService - createMedicalAlert error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create medical alert');
    }
  },

  createVaccination: async (vaccinationData: Vaccination): Promise<any> => {
    try {
      const response = await apii.post('/api/vaccinations', vaccinationData);
      return response.data;
    } catch (error: any) {
      console.error('patientsService - createVaccination error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create vaccination');
    }
  },

  createPatientNote: async (noteData: PatientNote): Promise<any> => {
    try {
      const response = await apii.post('/api/patient-notes', noteData);
      return response.data;
    } catch (error: any) {
      console.error('patientsService - createPatientNote error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create patient note');
    }
  },

  getPatients: async (): Promise<Patient[]> => {
    try {
      const response = await apii.get<PatientsResponse>('/api/patients');
      return response.data.data;
    } catch (error: any) {
      console.error('patientsService - getPatients error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch patients');
    }
  },

  updatePatient: async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
    try {
      const response = await apii.put<{ success: boolean; data: Patient }>(`/api/patients/${id}`, patientData);
      return response.data.data;
    } catch (error: any) {
      console.error('patientsService - updatePatient error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update patient');
    }
  },

  deletePatient: async (id: string): Promise<void> => {
    try {
      await apii.delete(`/api/patients/${id}`);
    } catch (error: any) {
      console.error('patientsService - deletePatient error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete patient');
    }
  }
};

export default patientsService;