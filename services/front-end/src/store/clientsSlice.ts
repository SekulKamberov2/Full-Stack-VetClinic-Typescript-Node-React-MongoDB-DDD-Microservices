import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/authService';
import { Client } from '../models/Client'; 
import { resetAllSlices } from './rootActions';

interface ClientsState {
  clients: Client[];
  filteredClients: Client[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const initialState: ClientsState = {
  clients: [],
  filteredClients: [],
  loading: false,
  error: null,
  searchTerm: '',
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
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      if (!action.payload.trim()) {
        state.filteredClients = state.clients;
      } else {
        state.filteredClients = state.clients.filter(client =>
          `${client.firstName} ${client.lastName}`.toLowerCase().includes(action.payload.toLowerCase()) ||
          client.email.toLowerCase().includes(action.payload.toLowerCase())
        );
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearch: (state) => {
      state.searchTerm = '';
      state.filteredClients = state.clients;
    },
    resetClientsState: (state) => {
      state.clients = [];
      state.filteredClients = [];
      state.loading = false;
      state.error = null;
      state.searchTerm = '';
    }
  },
  extraReducers: (builder) => {
    builder 
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
        state.filteredClients = action.payload;
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
        if (!state.searchTerm || 
            `${action.payload.firstName} ${action.payload.lastName}`.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            action.payload.email.toLowerCase().includes(state.searchTerm.toLowerCase())) {
          state.filteredClients.push(action.payload);
        }
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
          const filteredIndex = state.filteredClients.findIndex(client => client.id === action.payload.id);
          if (filteredIndex !== -1) {
            state.filteredClients[filteredIndex] = action.payload;
          }
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
        state.filteredClients = state.filteredClients.filter(client => client.id !== action.payload);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to delete client';
      })
      .addCase(resetAllSlices, (state) => {
        state.clients = [];
        state.filteredClients = [];
        state.loading = false;
        state.error = null;
        state.searchTerm = '';
      });
  },
});

export const { 
  setSearchTerm, 
  clearError, 
  clearSearch, 
  resetClientsState
} = clientsSlice.actions;

export default clientsSlice.reducer;
