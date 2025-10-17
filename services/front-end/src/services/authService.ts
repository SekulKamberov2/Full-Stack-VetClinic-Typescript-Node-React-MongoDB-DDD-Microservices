import axios from 'axios';
import { Client, LoginData, RegisterData } from '../models/Client';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const apii = axios.create({
  baseURL: 'http://localhost:3003',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const clientApi = axios.create({
  baseURL: 'http://localhost:3002',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: Client; 
    token?: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: Client;
}

export const authService = {
  login: async (loginData: LoginData): Promise<any> => {
    try {
      const response = await api.post<any>('/auth/login', loginData);
      console.log('authService login', response);
      return response.data; // ? true : false;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', registerData);
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.get<ProfileResponse>('/profile');
      console.log('getProfile - no role', response)
      return response.data;
    } catch (error: any) {
      
      try {
        const response = await api.get<ProfileResponse>('/clients/profile');
        return response.data;
      } catch (secondError: any) {
        
        try {
          const response = await clientApi.get<ProfileResponse>('/profile');
          return response.data;
        } catch (finalError: any) {
          console.error('All profile endpoints failed:');
          console.error('API Gateway error:', error.response?.data || error.message);
          console.error('Fallback error:', secondError.response?.data || secondError.message);
          console.error('Client service error:', finalError.response?.data || finalError.message);
          
          throw new Error(
            finalError.response?.data?.message || 
            'Failed to load profile from all available endpoints'
          );
        }
      }
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message);
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken') || null;
  },

  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    return !!token;
  },

  verifyAuth: async (): Promise<{ success: boolean; client?: Client }> => {
    try {
      const response = await api.get<ProfileResponse>('/profile');
      return { success: true, client: response.data.data };
    } catch (error: any) {
      console.log('Auth verification failed:', error.response?.data || error.message);
      
      try {
        const response = await api.get<ProfileResponse>('/clients/profile');
        return { success: true, client: response.data.data };
      } catch (fallbackError) {
        return { success: false };
      }
    }
  }
};
