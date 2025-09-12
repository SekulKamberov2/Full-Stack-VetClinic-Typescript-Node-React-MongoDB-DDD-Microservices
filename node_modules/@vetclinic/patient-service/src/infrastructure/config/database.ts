import mongoose from 'mongoose';
import { AppError, ValidationError } from '@vetclinic/shared-kernel';

export interface DatabaseConfig {
  uri: string;
  options?: mongoose.ConnectOptions;
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private _isConnected = false; 
  private connection: mongoose.Connection | null = null;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (this._isConnected) {
      return;
    }

    try {
      if (!config.uri || config.uri.trim() === '') {
        throw new ValidationError('MongoDB connection URI is required');
      }

      const defaultOptions: mongoose.ConnectOptions = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        ...config.options
      };

      await mongoose.connect(config.uri, defaultOptions);

      this.connection = mongoose.connection;
      this._isConnected = true;
      
      console.log('Patient Service MongoDB connection established successfully');
      this.setupEventListeners();
      
    } catch (error) {
      throw new AppError(
        `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DATABASE_CONNECTION_FAILED',
        error
      );
    }
  }

  async disconnect(): Promise<void> {
    if (!this._isConnected || !this.connection) {
      return;
    }

    try {
      await mongoose.connection.close();
      this._isConnected = false;
      this.connection = null;
      console.log('Patient Service MongoDB connection closed successfully');
    } catch (error) {
      throw new AppError(
        `Failed to disconnect from database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DATABASE_DISCONNECT_FAILED',
        error
      );
    }
  }

  isConnected(): boolean {
    return this._isConnected && mongoose.connection.readyState === 1;
  }

  getConnection(): mongoose.Connection {
    if (!this.isConnected() || !this.connection) {
      throw new AppError('Database not connected', 'DATABASE_NOT_CONNECTED');
    }
    return this.connection;
  }

  getMongoose(): typeof mongoose {
    if (!this.isConnected()) {
      throw new AppError('Database not connected', 'DATABASE_NOT_CONNECTED');
    }
    return mongoose;
  }

  private setupEventListeners(): void {
    if (!this.connection) return;

    this.connection.on('connected', () => {
      console.log('Patient Service MongoDB connection established');
      this._isConnected = true;
    });

    this.connection.on('error', (error) => {
      console.error('Patient Service MongoDB connection error:', error);
      this._isConnected = false;
    });

    this.connection.on('disconnected', () => {
      console.log('Patient Service MongoDB connection disconnected');
      this._isConnected = false;
    });

    this.connection.on('reconnected', () => {
      console.log('Patient Service MongoDB connection reestablished');
      this._isConnected = true;
    });
  }

  async withTransaction<T>(callback: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
    if (!this.isConnected()) {
      throw new AppError('Database not connected', 'DATABASE_NOT_CONNECTED');
    }

    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected()) return false;
      await mongoose.connection.db.admin().ping();
      return true;
    } catch {
      return false;
    }
  } 
}

export const database = DatabaseConnection.getInstance();