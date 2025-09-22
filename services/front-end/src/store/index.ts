import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import clientsReducer from './clientsSlice';
import patientsReducer from './patientsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    patients: patientsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
