import axios from 'axios';
import { User, LoginData, RegisterData } from '../models/User';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const token = localStorage.getItem('token');
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', loginData);
    const token = response.data.data?.token;
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return response.data;
  },

  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', registerData);
    const token = response.data.data?.token;
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },

  getToken: (): string | null => localStorage.getItem('token'),
  isAuthenticated: (): boolean => !!localStorage.getItem('token'),
};
