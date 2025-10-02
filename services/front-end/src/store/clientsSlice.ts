import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/authService';
import { Client } from '../models/Client'; 

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

export const fetchClients = createAsyncThunk<Client[]>(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<{ success: boolean; data: Client[] }>('/clients');
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

export const addClient = createAsyncThunk<Client, Omit<Client, 'id' | '_id'>>(
  'clients/addClient',
  async (client, { rejectWithValue }) => {
    try {
      const res = await api.post<{ success: boolean; data: Client }>('/clients', client);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add client');
    }
  }
);

export const updateClient = createAsyncThunk<Client, Client>(
  'clients/updateClient',
  async (client, { rejectWithValue }) => {
    try {
      const res = await api.put<{ success: boolean; data: Client }>(
        `/clients/${client.id}`, 
        client
      );
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update client');
    }
  }
);

export const deleteClient = createAsyncThunk<string, string>(
  'clients/deleteClient',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/clients/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete client');
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
      })
      .addCase(addClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
      })
      .addCase(addClient.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to add client';
      })
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update client';
      })
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client.id !== action.payload);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to delete client';
      });
  },
});

export default clientsSlice.reducer;
