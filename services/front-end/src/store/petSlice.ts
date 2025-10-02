import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { petService } from '../services/petService';
import { Pet } from '../models/Pet';

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
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(createPet.fulfilled, (state, action) => {
        state.pets.push(action.payload);
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        const index = state.pets.findIndex(pet => pet._id === action.payload._id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.pets = state.pets.filter(pet => pet._id !== action.payload);
      });
  },
});

export const { clearError, selectPet, clearSelectedPet } = petSlice.actions;
export default petSlice.reducer;
