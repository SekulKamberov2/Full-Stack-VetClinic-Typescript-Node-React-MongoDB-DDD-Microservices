import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/authService';
import { Patient } from '../models/Patient'; 

interface PatientsState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
}

const initialState: PatientsState = {
  patients: [],
  loading: false,
  error: null,
};

export const fetchPatients = createAsyncThunk<Patient[]>(
  'patients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<{ success: boolean; data: Patient[] }>('/patients'); 
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load patients');
    }
  }
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default patientsSlice.reducer;
