import { Service, ServiceProps } from '../../domain/entities/Service';
import { ServiceRepository, ServiceCategory } from '../../domain/repositories/ServiceRepository';
import { ServiceModel } from '../persistence/models/ServiceModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoServiceRepository implements ServiceRepository {
  private model: typeof ServiceModel;

  constructor() {
    this.model = ServiceModel;
  }

  async findById(id: string): Promise<Service | null> {
    try {
      const serviceDoc = await this.model.findById(id).exec();
      return serviceDoc ? this.toEntity(serviceDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByName(name: string): Promise<Service[]> {
    try {
      const serviceDocs = await this.model.find({ 
        name: { $regex: new RegExp(name, 'i') },
        isActive: true 
      }).exec();
      return serviceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByName');
    }
  }

  async search(query: string): Promise<Service[]> { 
    try {
      const serviceDocs = await this.model.find({
        $text: { $search: query },
        isActive: true
      }).exec();
      return serviceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'search');
    }
  }

  async findByCategory(category: ServiceCategory): Promise<Service[]> {
    try {
      const serviceDocs = await this.model.find({ 
        category, 
        isActive: true 
      }).exec();
      return serviceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByCategory');
    }
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]> {
    try {
      const serviceDocs = await this.model.find({ 
        price: { $gte: minPrice, $lte: maxPrice },
        isActive: true 
      }).exec();
      return serviceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByPriceRange');
    }
  }

  async findAllActive(): Promise<Service[]> {
    try {
      const serviceDocs = await this.model.find({ isActive: true }).exec();
      return serviceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAllActive');
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      const serviceDocs = await this.model.find().exec();
      return serviceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async getStats(): Promise<{
    totalServices: number;
    activeServices: number;
    servicesByCategory: Record<string, number>;
  }> {
    try {
      const totalServices = await this.model.countDocuments();
      const activeServices = await this.model.countDocuments({ isActive: true });
      
      const servicesByCategoryAgg = await this.model.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      
      const servicesByCategory: Record<string, number> = {};
      servicesByCategoryAgg.forEach(item => {
        servicesByCategory[item._id] = item.count;
      });

      return {
        totalServices,
        activeServices,
        servicesByCategory
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getStats');
    }
  }

  async save(service: Service): Promise<Service> {
    try {
      if (!service.id || service.id === '') {
        const serviceDoc = new this.model(this.toDocument(service));
        const savedDoc = await serviceDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        service.id,
        this.toDocument(service),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Service with ID ${service.id} not found`,
          undefined,
          'ServiceRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(service: Service): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        service.id,
        this.toDocument(service),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Service with ID ${service.id} not found`,
          undefined,
          'ServiceRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(id, { 
        isActive: false, 
        updatedAt: new Date() 
      }).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Service with ID ${id} not found`,
          undefined,
          'ServiceRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  async searchServices(query: string): Promise<Service[]> {
    try {
      const serviceDocs = await this.model.find({
        $text: { $search: query },
        isActive: true
      })
      .sort({ score: { $meta: 'textScore' } }) 
      .exec();
      
      return serviceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'searchServices');
    }
  }

  async getServiceStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
    priceRange: { min: number; max: number; average: number };
  }> {
    try {
      const total = await this.model.countDocuments();
      const active = await this.model.countDocuments({ isActive: true });
      
      const byCategoryAgg = await this.model.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      
      const byCategory: Record<string, number> = {};
      byCategoryAgg.forEach(item => {
        byCategory[item._id] = item.count;
      });

      const priceStats = await this.model.aggregate([
        { $match: { isActive: true } },
        { 
          $group: {
            _id: null,
            min: { $min: '$price' },
            max: { $max: '$price' },
            avg: { $avg: '$price' }
          }
        }
      ]);

      const priceRange = priceStats.length > 0 ? {
        min: priceStats[0].min,
        max: priceStats[0].max,
        average: priceStats[0].avg
      } : { min: 0, max: 0, average: 0 };

      return {
        total,
        active,
        byCategory,
        priceRange
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getServiceStats');
    }
  }

  async reactivate(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(id, { 
        isActive: true, 
        updatedAt: new Date() 
      }).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Service with ID ${id} not found`,
          undefined,
          'ServiceRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'reactivate');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'exists');
    }
  }

  private toEntity(doc: any): Service {
    const props: ServiceProps = {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      category: doc.category,
      price: doc.price,
      duration: doc.duration,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }; 
    return Service.create(props);
  }

  private toDocument(service: Service): Partial<any> {
    return {
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration,
      isActive: service.isActive,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoServiceRepository.${operation}`;
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ValidationError(
        `Database validation failed: ${error.message}`,
        error,
        context
      );
    }
    
    if (error instanceof Error && error.name === 'CastError') {
      throw new ValidationError(
        'Invalid ID format',
        error,
        context
      );
    }
    
    if (this.isDuplicateKeyError(error)) {
      throw new AppError(
        'Duplicate service detected',
        'DUPLICATE_SERVICE',
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
}
