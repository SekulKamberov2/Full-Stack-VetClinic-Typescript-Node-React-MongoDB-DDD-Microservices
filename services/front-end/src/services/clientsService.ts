import { api } from './authService';

export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pets: Pet[];
  isActive: boolean;
}

export interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  dateOfBirth: string;
  weight: number;
  color: string;
  gender: string;
  profileImage?: string;
  microchipNumber?: string;
  insuranceNumber?: string;
  isActive: boolean;
  clientId: string;
}

export interface ClientsResponse {
  success: boolean;
  data: Client[];
}

export const clientsService = {
  getClients: async (): Promise<Client[]> => {
    try {
      const response = await api.get<ClientsResponse>('/clients');
      console.log('clientsService - getClients response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('clientsService - getClients error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch clients');
    }
  },

  searchClients: async (query: string): Promise<Client[]> => {
    try {
      const response = await api.get<ClientsResponse>(`/clients/search?q=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch (error: any) {
      console.error('clientsService - searchClients error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search clients');
    }
  }
};
