import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/authService';
import { Client } from '../models/Client';
import { RootState } from '.';

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  loading: false,
  error: null,
};

export const fetchClients = createAsyncThunk<Client[], void, { state: RootState }>(
  'clients/fetchAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const res = await api.get<{ success: boolean; data: Client[] }>('/clients', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('clients', res.data.data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load clients');
    }
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch clients';
      });
  },
});

export default clientsSlice.reducer;
