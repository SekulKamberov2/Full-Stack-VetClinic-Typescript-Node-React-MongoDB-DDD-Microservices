import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; 
import clientsReducer from './clientsSlice';
import patientsReducer from './patientsSlice';
import petReducer from './petSlice'; 
import profileReducer from './profileSlice'; 

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    auth: authReducer,
    clients: clientsReducer,  
    pets: petReducer,
    patients: patientsReducer,
  },
});
 
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;