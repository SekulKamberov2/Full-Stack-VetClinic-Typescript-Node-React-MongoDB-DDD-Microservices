import mongoose from 'mongoose';
import { ServiceModel } from '../persistence/models/ServiceModel';

export const connectDB = async (uri: string): Promise<void> => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
     
    await ServiceModel.createIndexes();
    console.log('Service model indexes created successfully');
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.connection.close();
};