import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Client, LoginData, RegisterData } from '../models/Client';
import { authService } from '../services/authService';

interface AuthState {
  client: Client | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  client: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

export const verifyAuth = createAsyncThunk<Client>(
  'auth/verify',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.data;
    } catch (err: any) {
      return rejectWithValue('Not authenticated');
    }
  }
);

export const loginUser = createAsyncThunk<void, LoginData>(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await authService.login(loginData);
      if (response) {
        return;
      } else {
        return rejectWithValue('Login failed');
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk<{ client: Client }, RegisterData>(
  'auth/register',
  async (registerData, { rejectWithValue }) => {
    try {
      const response = await authService.register(registerData);
      return { client: response.data.user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchClientProfile = createAsyncThunk<Client>(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      console.log('fetchClientProfile', response.data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue('Failed to fetch profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.client = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
    setClient: (state, action: { payload: Client }) => {
      state.client = action.payload;
      state.isAuthenticated = true;
    },
    updateClient: (state, action: { payload: Partial<Client> }) => {
      if (state.client) {
        state.client = { ...state.client, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Login failed';
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(registerUser.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.client = action.payload.client;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Registration failed';
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(verifyAuth.pending, (state) => { 
        state.loading = true; 
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.client = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.loading = false;
        state.client = null;
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(fetchClientProfile.pending, (state) => { 
        state.loading = true; 
      })
      .addCase(fetchClientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.client = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchClientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch profile';
      });
  },
});

export const { logout, clearError, setClient, updateClient } = authSlice.actions;

export const selectClient = (state: { auth: AuthState }) => state.auth.client;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthInitialized = (state: { auth: AuthState }) => state.auth.initialized;
export const selectClientPets = (state: { auth: AuthState }) => state.auth.client?.pets || [];

export default authSlice.reducer;
