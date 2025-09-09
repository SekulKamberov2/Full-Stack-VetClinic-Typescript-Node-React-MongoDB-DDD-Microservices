import mongoose from 'mongoose';
import { MedicalRecordModel } from '../persistence/models/MedicalRecord';  
import { DiagnosisModel } from '../persistence/models/DiagnosisModel';  
import { TreatmentModel } from '../persistence/models/TreatmentModel'; 
import { PrescriptionModel } from '../persistence/models/PrescriptionModel';  
import { AppError, ValidationError, ErrorHandler } from '@vetclinic/shared-kernel';

export const connectDB = async (uri: string): Promise<void> => {
  try { 
    if (!uri || uri.trim() === '') {
      throw new ValidationError('MongoDB connection URI is required', undefined, 'Database connection');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,  
      socketTimeoutMS: 45000,  
    });  
    
    await createIndexes(); 
    console.log('MongoDB connection established successfully');
    
  } catch (error) {
    const context = 'MongoDB connection';
    console.error(`${context} error:`, error);
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    throw new AppError(
      `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_CONNECTION_FAILED',
      error,
      context
    );
  }
};

const createIndexes = async (): Promise<void> => {
  try {  
    await MedicalRecordModel.createIndexes(); 
     
    if (DiagnosisModel && DiagnosisModel.createIndexes) {
      await DiagnosisModel.createIndexes(); 
    }
    
    if (TreatmentModel && TreatmentModel.createIndexes) {
      await TreatmentModel.createIndexes(); 
    }
    
    if (PrescriptionModel && PrescriptionModel.createIndexes) {
      await PrescriptionModel.createIndexes(); 
    } 
    
    console.log('Database indexes created successfully');
    
  } catch (error) {
    const context = 'Database index creation';
    console.error(`${context} error:`, error);
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    throw new AppError(
      `Failed to create database indexes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'INDEX_CREATION_FAILED',
      error,
      context
    );
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {  
      await mongoose.connection.close(); 
      console.log('MongoDB connection closed successfully');
    }
  } catch (error) {
    const context = 'MongoDB connection closure';
    console.error(`${context} error:`, error);
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    throw new AppError(
      `Failed to close database connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_CLOSURE_FAILED',
      error,
      context
    );
  }
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState !== 1) {  
      return false;
    }
    
    await mongoose.connection.db.admin().ping(); 
    return true;
  } catch (error) {
    const context = 'Database health check';
    console.error(`${context} failed:`, error);
    return false;
  }
};

export const getDatabaseStats = async (): Promise<any> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database not connected', 'DATABASE_NOT_CONNECTED', undefined, 'Database statistics');
    }

    const stats = await mongoose.connection.db.stats(); 
    return stats;
  } catch (error) {
    const context = 'Database statistics';
    console.error(`Failed to get ${context}:`, error);
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    throw new AppError(
      `Failed to get database statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STATS_RETRIEVAL_FAILED',
      error,
      context
    );
  }
};

export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const getConnectionState = (): string => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};
 
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (error) => {
  const context = 'MongoDB connection error event';
  console.error(`${context}:`, error);
  
  if (!AppError.isAppError(error)) {
    ErrorHandler.handleAppError(error, context);
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB connection reestablished');
});

mongoose.connection.on('close', () => {
  console.log('MongoDB connection closed');
});