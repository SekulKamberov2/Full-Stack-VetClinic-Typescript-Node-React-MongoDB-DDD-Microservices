import mongoose from 'mongoose';
import { AppError } from '@vetclinic/shared-kernel';

export const database = {
  isConnected: (): boolean => {
    return mongoose.connection.readyState === 1;
  },

  connect: async (config: { uri: string; options?: any }): Promise<void> => {
    try {
      if (database.isConnected()) {
        console.log('Database already connected');
        return;
      }

      await mongoose.connect(config.uri, {
        ...config.options,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      throw new AppError(
        'Failed to connect to database', 
        'DATABASE_CONNECTION_ERROR',
        error
      );
    }
  },

  disconnect: async (): Promise<void> => {
    try {
      if (database.isConnected()) {
        await mongoose.disconnect();
        console.log('Database disconnected');
      }
    } catch (error) {
      throw new AppError(
        'Failed to disconnect from database',
        'DATABASE_DISCONNECT_ERROR',
        error
      );
    }
  },

  healthCheck: async (): Promise<boolean> => {
    return database.isConnected();
  },

  createIndexes: async (): Promise<void> => {
    try {
      const models = mongoose.modelNames();
      for (const modelName of models) {
        const model = mongoose.model(modelName);
        await model.createIndexes();
      }
      console.log('Database indexes created successfully');
    } catch (error) {
      throw new AppError(
        'Failed to create database indexes',
        'DATABASE_INDEX_ERROR',
        error
      );
    }
  }
};
