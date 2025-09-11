import { database } from '../config/database';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';
import mongoose from 'mongoose';

export abstract class BaseMongoRepository<T> {
  protected abstract model: mongoose.Model<any>;
  protected abstract toEntity(doc: any): T;
  protected abstract toDocument(entity: T): any;

  protected ensureConnection(): void {
    if (!database.isConnected()) {
      throw new AppError('Database not connected', 'DATABASE_NOT_CONNECTED');
    }
  }

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

  async withTransaction<R>(operation: (session: mongoose.ClientSession) => Promise<R>): Promise<R> {
    this.ensureConnection();
    return database.withTransaction(operation);
  }

  async findById(id: string): Promise<T | null> {
    try {
      this.ensureConnection();
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

  async findAll(filter: any = {}, options: {
    sort?: any;
    limit?: number;
    skip?: number;
  } = {}): Promise<T[]> {
    try {
      this.ensureConnection();
      
      let query = this.model.find(filter);
      
      if (options.sort) query = query.sort(options.sort);
      if (options.skip) query = query.skip(options.skip);
      if (options.limit) query = query.limit(options.limit);
      
      const documents = await this.executeWithLogging('findAll', () => query.exec());
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async find(filter: any = {}, options: {
    sort?: any;
    limit?: number;
    skip?: number;
  } = {}): Promise<T[]> {
    try {
      this.ensureConnection();
      
      let query = this.model.find(filter);
      
      if (options.sort) query = query.sort(options.sort);
      if (options.skip) query = query.skip(options.skip);
      if (options.limit) query = query.limit(options.limit);
      
      const documents = await this.executeWithLogging('find', () => query.exec());
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'find');
    }
  }

  async findOne(filter: any = {}): Promise<T | null> {
    try {
      this.ensureConnection();
      
      const document = await this.executeWithLogging('findOne', () =>
        this.model.findOne(filter).exec()
      );
      return document ? this.toEntity(document) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findOne');
    }
  }

  async save(entity: T): Promise<T> {
    try {
      this.ensureConnection();
      
      const document = new this.model(this.toDocument(entity));
      const savedDoc = await this.executeWithLogging('save', () =>
        document.save()
      );
      return this.toEntity(savedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }
 
async update(idOrEntity: string | (T & { id: string }), entity?: T): Promise<boolean> {
  try {
    this.ensureConnection();
    
    let id: string;
    let entityToUpdate: T;
    
    if (typeof idOrEntity === 'string') { 
      id = idOrEntity;
      entityToUpdate = entity!;
      this.validateId(id);
    } else { 
      const entityWithId = idOrEntity;
      if (!entityWithId.id) {
        throw new ValidationError(
          "Entity must have an id property",
          undefined,
          'Database operation'
        );
      }
      id = entityWithId.id;
      entityToUpdate = entityWithId;
      this.validateId(id);
    }
    
    const result = await this.executeWithLogging('update', () =>
      this.model.findByIdAndUpdate(
        id, 
        this.toDocument(entityToUpdate),
        { new: true, runValidators: true }
      ).exec()
    );
    
    return result !== null;
  } catch (error) {
    this.handleDatabaseError(error, 'update');
  }
} 
   
  async delete(id: string): Promise<boolean> {
    try {
      this.ensureConnection();
      this.validateId(id);

      const result = await this.executeWithLogging("delete", () =>
        this.model.findByIdAndDelete(id).exec()
      );

      return result !== null;
    } catch (error) {
      this.handleDatabaseError(error, "delete");
    }
  }



  async deleteOrThrow(id: string): Promise<void> {
    const deleted = await this.delete(id);
    if (!deleted) {
      throw new NotFoundError(
        `Entity with ID ${id} not found`, 
        undefined, 
        'Database operation',
        this.model.modelName,
        id
      );
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      this.ensureConnection();
      this.validateId(id);
      
      const count = await this.executeWithLogging('exists', () =>
        this.model.countDocuments({ _id: id }).exec()
      );
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'exists');
    }
  }

  async count(filter: any = {}): Promise<number> {
    try {
      this.ensureConnection();
      
      return await this.executeWithLogging('count', () =>
        this.model.countDocuments(filter).exec()
      );
    } catch (error) {
      this.handleDatabaseError(error, 'count');
    }
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

  async findAllPaginated(
    filter: any = {},
    page: number = 1,
    limit: number = 10,
    sort: any = { createdAt: -1 }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      this.ensureConnection();
      
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        this.findAll(filter, { sort, skip, limit }),
        this.count(filter)
      ]);
      
      const pages = Math.ceil(total / limit);
      
      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.handleDatabaseError(error, 'findAllPaginated');
    }
  }

  async updateById(id: string, updateData: Partial<T>): Promise<boolean> {
    try {
      this.ensureConnection();
      this.validateId(id);
      
      const result = await this.executeWithLogging('updateById', () =>
        this.model.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).exec()
      );
      
      return result !== null;
    } catch (error) {
      this.handleDatabaseError(error, 'updateById');
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      this.ensureConnection();
      this.validateId(id);
      
      const result = await this.executeWithLogging('softDelete', () =>
        this.model.findByIdAndUpdate(
          id,
          { deleted: true, deletedAt: new Date() },
          { new: true }
        ).exec()
      );
      
      return result !== null;
    } catch (error) {
      this.handleDatabaseError(error, 'softDelete');
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      this.ensureConnection();
      this.validateId(id);
      
      const result = await this.executeWithLogging('restore', () =>
        this.model.findByIdAndUpdate(
          id,
          { deleted: false, deletedAt: null },
          { new: true }
        ).exec()
      );
      
      return result !== null;
    } catch (error) {
      this.handleDatabaseError(error, 'restore');
    }
  }

  async findActive(filter: any = {}): Promise<T[]> {
    try {
      this.ensureConnection();
      
      const activeFilter = { ...filter, deleted: { $ne: true } };
      return this.findAll(activeFilter);
    } catch (error) {
      this.handleDatabaseError(error, 'findActive');
    }
  }

  async findDeleted(filter: any = {}): Promise<T[]> {
    try {
      this.ensureConnection();
      
      const deletedFilter = { ...filter, deleted: true };
      return this.findAll(deletedFilter);
    } catch (error) {
      this.handleDatabaseError(error, 'findDeleted');
    }
  }

  async search(query: string, fields: string[]): Promise<T[]> {
    try {
      this.ensureConnection();
      
      if (!query || query.trim() === '') {
        return [];
      }

      const searchConditions = fields.map(field => ({
        [field]: { $regex: new RegExp(query, 'i') }
      }));

      const documents = await this.executeWithLogging('search', () =>
        this.model.find({ $or: searchConditions }).exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'search');
    }
  }

  async findByField(field: string, value: any): Promise<T[]> {
    try {
      this.ensureConnection();
      
      const documents = await this.executeWithLogging('findByField', () =>
        this.model.find({ [field]: value }).exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByField');
    }
  }

  async findOneByField(field: string, value: any): Promise<T | null> {
    try {
      this.ensureConnection();
      
      const document = await this.executeWithLogging('findOneByField', () =>
        this.model.findOne({ [field]: value }).exec()
      );
      
      return document ? this.toEntity(document) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findOneByField');
    }
  }
}
