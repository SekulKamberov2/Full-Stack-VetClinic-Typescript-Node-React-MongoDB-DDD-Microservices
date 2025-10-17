import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { petService } from '../services/petService';
import { Pet } from '../models/Pet';
import { resetAllSlices } from './rootActions';

interface PetState {
  pets: Pet[];
  selectedPet: Pet | null;
  loading: boolean;
  error: string | null;
}

const initialState: PetState = {
  pets: [],
  selectedPet: null,
  loading: false,
  error: null,
};

export const fetchPets = createAsyncThunk(
  'pets/fetchPets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await petService.getPets();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pets');
    }
  }
);

export const fetchPetsByClient = createAsyncThunk(
  'pets/fetchPetsByClient',
  async (clientId: string, { rejectWithValue }) => {
    try {
      const response = await petService.getPetsByClient(clientId);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pets');
    }
  }
);

export const createPet = createAsyncThunk(
  'pets/createPet',
  async (petData: Partial<Pet>, { rejectWithValue }) => {
    try {
      const response = await petService.createPet(petData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create pet');
    }
  }
);

export const updatePet = createAsyncThunk(
  'pets/updatePet',
  async ({ petId, updateData }: { petId: string; updateData: Partial<Pet> }, { rejectWithValue }) => {
    try {
      const response = await petService.updatePet(petId, updateData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update pet');
    }
  }
);

export const deletePet = createAsyncThunk(
  'pets/deletePet',
  async (petId: string, { rejectWithValue }) => {
    try {
      await petService.deletePet(petId);
      return petId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete pet');
    }
  }
);

const petSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    selectPet: (state, action) => {
      state.selectedPet = action.payload;
    },
    clearSelectedPet: (state) => {
      state.selectedPet = null;
    },
    resetPetState: (state) => {
      state.pets = [];
      state.selectedPet = null;
      state.loading = false;
      state.error = null;
    },
    resetPetsComplete: () => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetAllSlices, () => {
        return initialState;
      })
      .addCase(fetchPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPets.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = action.payload;
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPetsByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPetsByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = action.payload;
      })
      .addCase(fetchPetsByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPet.fulfilled, (state, action) => {
        state.loading = false;
        state.pets.push(action.payload);
      })
      .addCase(createPet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pets.findIndex(pet => pet._id === action.payload._id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
        if (state.selectedPet?._id === action.payload._id) {
          state.selectedPet = action.payload;
        }
      })
      .addCase(updatePet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = state.pets.filter(pet => pet._id !== action.payload);
        if (state.selectedPet?._id === action.payload) {
          state.selectedPet = null;
        }
      })
      .addCase(deletePet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  selectPet, 
  clearSelectedPet,
  resetPetState,
  resetPetsComplete
} = petSlice.actions;

export default petSlice.reducer;
