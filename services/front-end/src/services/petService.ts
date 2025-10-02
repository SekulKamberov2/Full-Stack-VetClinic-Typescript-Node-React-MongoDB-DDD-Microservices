import { api } from './authService';
import { Pet, Award } from '../models/Pet';

export const petService = {
  getPets: async (): Promise<{ success: boolean; data: Pet[] }> => {
    const response = await api.get('/client-pets/pets');
    return response.data;
  },

  getPetsByClient: async (clientId: string): Promise<{ success: boolean; data: Pet[] }> => {
    const response = await api.get(`/client-pets/clients/${clientId}/pets`);
    return response.data;
  },

  createPet: async (petData: Partial<Pet>): Promise<{ success: boolean; data: Pet }> => {
    const response = await api.post('/client-pets/pets', petData);
    return response.data;
  },

  updatePet: async (petId: string, updateData: Partial<Pet>): Promise<{ success: boolean; data: Pet }> => {
    const response = await api.put(`/client-pets/pets/${petId}`, updateData);
    return response.data;
  },

  deletePet: async (petId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/client-pets/pets/${petId}`);
    return response.data;
  },

  getPetAwards: async (petId: string): Promise<{ success: boolean; data: Award[] }> => {
    const response = await api.get(`/pets-awards/pets/${petId}/awards`);
    return response.data;
  },
};