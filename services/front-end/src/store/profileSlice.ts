import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileService, ProfileData } from '../services/profileService';
import { petHealthService, PatientDetails } from '../services/petHealthService';
import { resetAllSlices } from './rootActions';

export interface Award {
  _id: string;
  name: string;
  description: string;
  points: number;
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
  gender: 'Male' | 'Female';
  microchipNumber?: string;
  insuranceNumber?: string;
  dietaryRestrictions: string[];
  isActive: boolean;
  awards?: Award[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  _id?: string; 
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profileImage: string;
  address: Address;
  pets: Pet[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
  petHealthDetails: PatientDetails | null;
  petHealthLoading: boolean;
  petHealthError: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  updateSuccess: false,
  petHealthDetails: null,
  petHealthLoading: false,
  petHealthError: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile();
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Invalid response structure from API');
      }
    } catch (error: any) {
      console.error('fetchProfile thunk error:', error);
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: ProfileData, { rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(profileData);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const updateProfileImage = createAsyncThunk(
  'profile/updateProfileImage',
  async (profileImage: string, { rejectWithValue }) => {
    try {
      const response = await profileService.updateProfileImage(profileImage);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update profile image');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile image');
    }
  }
);

export const deleteProfile = createAsyncThunk(
  'profile/deleteProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.deleteProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete profile');
    }
  }
);

export const fetchClientPets = createAsyncThunk(
  'profile/fetchClientPets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getClientPets();
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to fetch pets');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pets');
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await profileService.uploadProfileImage(file);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload image');
    }
  }
);

export const fetchPetHealthDetails = createAsyncThunk(
  'profile/fetchPetHealthDetails',
  async ({ ownerId, patientId }: { ownerId: string; patientId: string }, { rejectWithValue }) => {
    try {
      const response = await petHealthService.getPetHealthDetails(ownerId, patientId);
       
      if (response.success) {
        if (response.data) {
          return response.data;
        } else {
          throw new Error('No health data available for this pet');
        }
      } else { 
        const errorMessage = (response as any).message || 'Failed to fetch pet health details';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('fetchPetHealthDetails thunk error:', error);
      return rejectWithValue(error.message || 'Failed to fetch pet health details');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.updateSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    updateProfileField: (state, action: PayloadAction<Partial<Profile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    updatePet: (state, action: PayloadAction<{ petId: string; updates: Partial<Pet> }>) => {
      if (state.profile) {
        const petIndex = state.profile.pets.findIndex(pet => pet._id === action.payload.petId);
        if (petIndex !== -1) {
          state.profile.pets[petIndex] = { 
            ...state.profile.pets[petIndex], 
            ...action.payload.updates 
          };
        }
      }
    },
    addPet: (state, action: PayloadAction<Pet>) => {
      if (state.profile) {
        state.profile.pets.push(action.payload);
      }
    },
    removePet: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.pets = state.profile.pets.filter(pet => pet._id !== action.payload);
      }
    },
    resetProfileState: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.updateSuccess = false;
    },
    resetProfileComplete: () => {
      return initialState;
    },
    resetProfileAndHealth: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.updateSuccess = false;
      state.petHealthDetails = null;
      state.petHealthLoading = false;
      state.petHealthError = null;
    },
    clearPetHealthDetails: (state) => {
      state.petHealthDetails = null;
      state.petHealthError = null;
    },
    clearPetHealthError: (state) => {
      state.petHealthError = null;
    },
    resetLoadingStates: (state) => {
      state.loading = false;
      state.petHealthLoading = false;
    },
    resetAllErrors: (state) => {
      state.error = null;
      state.petHealthError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetAllSlices, () => {
        return initialState;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {  
        state.loading = false;
        
        if (action.payload) { 
          const profileData = action.payload as Profile;
          state.profile = {
            ...profileData, 
          };
        } else {
          state.profile = null;
        }
        
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.profile = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      })
      .addCase(updateProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && state.profile) {
          state.profile.profileImage = action.payload.profileImage || state.profile.profileImage;
        }
        state.error = null;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        state.error = null;
        state.updateSuccess = false;
        state.petHealthDetails = null;
        state.petHealthLoading = false;
        state.petHealthError = null;
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchClientPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientPets.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.pets = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchClientPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile && action.payload.imageUrl) {
          state.profile.profileImage = action.payload.imageUrl;
        }
        state.error = null;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPetHealthDetails.pending, (state) => {
        state.petHealthLoading = true;
        state.petHealthError = null;
      })
      .addCase(fetchPetHealthDetails.fulfilled, (state, action) => {
        state.petHealthLoading = false;
        state.petHealthDetails = action.payload;
        state.petHealthError = null;
      })
      .addCase(fetchPetHealthDetails.rejected, (state, action) => {
        state.petHealthLoading = false;
        state.petHealthError = action.payload as string;
        state.petHealthDetails = null;
      });
  },
});

export const {
  clearProfile,
  clearError,
  clearUpdateSuccess,
  updateProfileField,
  updatePet,
  addPet,
  removePet,
  resetProfileState,
  resetProfileComplete,
  resetProfileAndHealth,
  resetLoadingStates,
  resetAllErrors,
  clearPetHealthDetails,
  clearPetHealthError,
} = profileSlice.actions;

export const selectProfile = (state: { profile: ProfileState }) => {
  return state.profile.profile;
};
export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.loading;
export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;
export const selectUpdateSuccess = (state: { profile: ProfileState }) => state.profile.updateSuccess;
export const selectPets = (state: { profile: ProfileState }) => state.profile.profile?.pets || [];
export const selectProfileAddress = (state: { profile: ProfileState }) => state.profile.profile?.address;
export const selectProfileImage = (state: { profile: ProfileState }) => state.profile.profile?.profileImage;
export const selectPetHealthDetails = (state: { profile: ProfileState }) => state.profile.petHealthDetails;
export const selectPetHealthLoading = (state: { profile: ProfileState }) => state.profile.petHealthLoading;
export const selectPetHealthError = (state: { profile: ProfileState }) => state.profile.petHealthError;

export default profileSlice.reducer;
