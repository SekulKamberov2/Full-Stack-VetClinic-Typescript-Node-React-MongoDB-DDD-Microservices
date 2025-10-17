import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from '../services/authService';
import { Patient } from '../models/Patient'; 
import { resetAllSlices } from './rootActions';

interface PatientsState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  currentPatient: Patient | null;
  creationStep: number;
}

const initialState: PatientsState = {
  patients: [],
  loading: false,
  error: null,
  currentPatient: null,
  creationStep: 0,
};

export const fetchPatients = createAsyncThunk<Patient[]>(
  'patients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apii.get<{ success: boolean; data: Patient[] }>('/api/patients'); 
      console.log('fetchPatients', res);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load patients');
    }
  }
);

export const createPatient = createAsyncThunk<Patient, any>(
  'patients/createPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const res = await apii.post<{ success: boolean; data: Patient }>('/api/patients', patientData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create patient');
    }
  }
);

export const createMedicalAlert = createAsyncThunk<any, any>(
  'patients/createMedicalAlert',
  async (alertData, { rejectWithValue }) => {
    try {
      const res = await apii.post('/api/medical-alerts', alertData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create medical alert');
    }
  }
);

export const createVaccination = createAsyncThunk<any, any>(
  'patients/createVaccination',
  async (vaccinationData, { rejectWithValue }) => {
    try {
      const res = await apii.post('/api/vaccinations', vaccinationData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create vaccination');
    }
  }
);

export const createPatientNote = createAsyncThunk<any, any>(
  'patients/createPatientNote',
  async (noteData, { rejectWithValue }) => {
    try {
      const res = await apii.post('/api/patient-notes', noteData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create patient note');
    }
  }
);

export const updatePatient = createAsyncThunk<Patient, { id: string; patientData: Partial<Patient> }>(
  'patients/updatePatient',
  async ({ id, patientData }, { rejectWithValue }) => {
    try {
      const res = await apii.put<{ success: boolean; data: Patient }>(`/api/patients/${id}`, patientData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update patient');
    }
  }
);

export const deletePatient = createAsyncThunk<string, string>(
  'patients/deletePatient',
  async (id, { rejectWithValue }) => {
    try {
      await apii.delete(`/api/patients/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete patient');
    }
  }
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPatient: (state, action) => {
      state.currentPatient = action.payload;
    },
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    },
    setCreationStep: (state, action) => {
      state.creationStep = action.payload;
    },
    resetCreationStep: (state) => {
      state.creationStep = 0;
    },
    resetPatientState: (state) => {
      state.patients = [];
      state.loading = false;
      state.error = null;
      state.currentPatient = null;
      state.creationStep = 0;
    },
    resetPatientsComplete: () => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetAllSlices, () => {
        return initialState;
      })
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch patients';
      })
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.push(action.payload);
        state.currentPatient = action.payload;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create patient';
      })
      .addCase(createMedicalAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMedicalAlert.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createMedicalAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create medical alert';
      })
      .addCase(createVaccination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVaccination.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createVaccination.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create vaccination';
      })
      .addCase(createPatientNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatientNote.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPatientNote.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create patient note';
      })
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.patients.findIndex(patient => patient._id === action.payload._id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
        if (state.currentPatient?._id === action.payload._id) {
          state.currentPatient = action.payload;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update patient';
      })
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = state.patients.filter(patient => patient._id !== action.payload);
        if (state.currentPatient?._id === action.payload) {
          state.currentPatient = null;
        }
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to delete patient';
      });
  },
});

export const { 
  clearError, 
  setCurrentPatient, 
  clearCurrentPatient, 
  setCreationStep, 
  resetCreationStep,
  resetPatientState,
  resetPatientsComplete  
} = patientsSlice.actions;

export default patientsSlice.reducer;