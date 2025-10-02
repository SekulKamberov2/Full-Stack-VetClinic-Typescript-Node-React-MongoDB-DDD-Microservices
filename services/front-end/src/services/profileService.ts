import { api } from './authService';

export interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  profileImage: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface ProfileDataResponse { 
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    pets: Array<{
      _id: string;
      name: string;
      species: string;
      breed: string;
      age: number;
      dateOfBirth: string;
      weight: number;
      color: string;
      gender: 'Male' | 'Female';
      microchipNumber?: string;
      insuranceNumber?: string;
      dietaryRestrictions: string[];
      isActive: boolean;
      awards?: Array<{
        _id: string;
        name: string;
        description: string;
        points: number;
      }>;
    }>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }; 

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    pets: Array<{
      _id: string;
      name: string;
      species: string;
      breed: string;
      age: number;
      dateOfBirth: string;
      weight: number;
      color: string;
      gender: 'Male' | 'Female';
      microchipNumber?: string;
      insuranceNumber?: string;
      dietaryRestrictions: string[];
      isActive: boolean;
      awards?: Array<{
        _id: string;
        name: string;
        description: string;
        points: number;
      }>;
    }>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export const profileService = {
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.get<ProfileResponse>('/profile');
      return response.data;
    } catch (error: any) {
      console.error('Profile service - getProfile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (profileData: ProfileData): Promise<UpdateProfileResponse> => {
    try {
      const response = await api.put<UpdateProfileResponse>('/edit', profileData);
      console.log('Profile service - updateProfile response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Profile service - updateProfile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  updateProfileImage: async (profileImage: string): Promise<UpdateProfileResponse> => {
    try {
        const response = await api.put<UpdateProfileResponse>('/profile', {
        profileImage
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Profile service - updateProfileImage error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile image');
    }
  },

  deleteProfile: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>('/profile');
      return response.data;
    } catch (error: any) {
      console.error('Profile service - deleteProfile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete profile');
    }
  },

  getClientPets: async (): Promise<{
    success: boolean;
    data: Array<{
      _id: string;
      name: string;
      species: string;
      breed: string;
      age: number;
      dateOfBirth: string;
      weight: number;
      color: string;
      gender: 'Male' | 'Female';
      microchipNumber?: string;
      insuranceNumber?: string;
      dietaryRestrictions: string[];
      isActive: boolean;
      awards?: Array<{
        _id: string;
        name: string;
        description: string;
        points: number;
      }>;
    }>;
  }> => {
    try {
      const response = await api.get('/client-pets/pets');
      return response.data;
    } catch (error: any) {
      console.error('Profile service - getClientPets error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pets');
    }
  },

  uploadProfileImage: async (file: File): Promise<{ success: boolean; imageUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.post<{ success: boolean; imageUrl: string }>(
        '/profile/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Profile service - uploadProfileImage error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  },

  verifyAuth: async (): Promise<{ success: boolean; user: any }> => {
    try {
      const response = await api.get<{ success: boolean; user: any }>('/auth/verify');
      return response.data;
    } catch (error: any) {
      console.error('Profile service - verifyAuth error:', error);
      throw new Error('Authentication verification failed');
    }
  },

  refreshToken: async (): Promise<{ success: boolean; accessToken: string }> => {
    try {
      const response = await api.post<{ success: boolean; accessToken: string }>('/auth/refresh');
      return response.data;
    } catch (error: any) {
      console.error('Profile service - refreshToken error:', error);
      throw new Error('Token refresh failed');
    }
  }
};

export default profileService;
