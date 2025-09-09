import { NotFoundError, ValidationError, AppError } from '@vetclinic/shared-kernel';
import mongoose from 'mongoose'; 

export abstract class BaseMongoRepository<T> {
  protected abstract model: mongoose.Model<any>;
  protected abstract toEntity(doc: any): T;
  protected abstract toDocument(entity: T): any;

  protected isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  protected validateId(id: string): void {
    if (!id || id.trim() === '') {
      throw new ValidationError('ID cannot be empty', undefined, 'Database operation');
    }
    
    if (!this.isValidObjectId(id)) {
      throw new ValidationError(`Invalid ID format: ${id}`, undefined, 'Database operation');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      this.validateId(id);
      const count = await this.model.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'exists');
    }
  }
 
  async delete(id: string): Promise<void> {
    try {
      this.validateId(id);
      const result = await this.model.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundError(
          `Entity with ID ${id} not found`, 
          undefined, 
          'Database operation',
          this.model.modelName,
          id
        );
      } 
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  protected handleDatabaseError(error: unknown, operation: string): never {
    const context = `${this.constructor.name}.${operation}`;
     
    if (AppError.isAppError(error)) {
      throw error;
    }
     
    if (error instanceof mongoose.Error.ValidationError) { 
      const validationDetails: Record<string, string[]> = {};
      
      for (const [path, errorObj] of Object.entries(error.errors)) {
        validationDetails[path] = [errorObj.message];
      }
      
      throw new ValidationError(
        `Validation failed: ${error.message}`,
        error,
        context,
        validationDetails
      );
    }
    
    if (error instanceof mongoose.Error.CastError) {
      throw new ValidationError(
        `Invalid ID format: ${error.value}`,
        error,
        context
      );
    }
    
    if (error instanceof mongoose.Error.DocumentNotFoundError) {
      throw new NotFoundError(
        'Document not found',
        error,
        context
      );
    }
     
    if (this.isDuplicateKeyError(error)) {
      throw new AppError(
        'Duplicate key error: A record with this data already exists',
        'DUPLICATE_KEY_ERROR',
        error,
        context
      );
    }
     
    if (this.isConnectionError(error)) {
      throw new AppError(
        'Database connection error',
        'DATABASE_CONNECTION_ERROR',
        error,
        context
      );
    }
     
    throw new AppError(
      `Database operation failed: ${operation}`,
      'DATABASE_OPERATION_FAILED',
      error,
      context
    );
  }

  protected async executeWithLogging<R>(
    operation: string,
    fn: () => Promise<R>
  ): Promise<R> {
    const startTime = Date.now();
    const context = `${this.constructor.name}.${operation}`;
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      console.log(`${context} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`${context} failed after ${duration}ms:`, error);
       
      throw error;
    }
  }
 
  private isDuplicateKeyError(error: unknown): boolean {
    return error instanceof Error && 
           'code' in error && 
           error.code === 11000;
  }
 
  private isConnectionError(error: unknown): boolean {
    return error instanceof Error && 
           (error.message.includes('connection') || 
            error.message.includes('connect') ||
            error.name.includes('Connection'));
  }
 
  async count(filter: any = {}): Promise<number> {
    try {
      return await this.executeWithLogging('count', () => 
        this.model.countDocuments(filter).exec()
      );
    } catch (error) {
      this.handleDatabaseError(error, 'count');
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      this.validateId(id);
      const document = await this.executeWithLogging('findById', () =>
        this.model.findById(id).exec()
      );
      return document ? this.toEntity(document) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByIdOrThrow(id: string): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundError(
        `Entity with ID ${id} not found`,
        undefined,
        'Database operation',
        this.model.modelName,
        id
      );
    }
    return entity;
  }
}
