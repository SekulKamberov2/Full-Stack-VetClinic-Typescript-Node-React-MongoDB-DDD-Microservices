import { Service, ServiceProps } from '../../domain/entities/Service';
import { ServiceRepository, ServiceCategory } from '../../domain/repositories/ServiceRepository';
import { ServiceModel } from '../persistence/models/ServiceModel';

export class MongoServiceRepository implements ServiceRepository {
  async findById(id: string): Promise<Service | null> {
    const serviceDoc = await ServiceModel.findById(id).exec();
    return serviceDoc ? this.toEntity(serviceDoc) : null;
  }

async findByName(name: string): Promise<Service[]> {
  const serviceDocs = await ServiceModel.find({ 
    name: { $regex: new RegExp(name, 'i') },
    isActive: true 
  }).exec();
  return serviceDocs.map(doc => this.toEntity(doc)) 
}

 
  async search(query: string): Promise<Service[]> { 
    const serviceDocs = await ServiceModel.find({
      $text: { $search: query },
      isActive: true
    }).exec();
    return serviceDocs.map(doc => this.toEntity(doc));
  }

  async findByCategory(category: ServiceCategory): Promise<Service[]> {
    const serviceDocs = await ServiceModel.find({ 
      category, 
      isActive: true 
    }).exec();
    return serviceDocs.map(doc => this.toEntity(doc));
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]> {
    const serviceDocs = await ServiceModel.find({ 
      price: { $gte: minPrice, $lte: maxPrice },
      isActive: true 
    }).exec();
    return serviceDocs.map(doc => this.toEntity(doc));
  }

  async findAllActive(): Promise<Service[]> {
    const serviceDocs = await ServiceModel.find({ isActive: true }).exec();
    return serviceDocs.map(doc => this.toEntity(doc));
  }

  async findAll(): Promise<Service[]> {
    const serviceDocs = await ServiceModel.find().exec();
    return serviceDocs.map(doc => this.toEntity(doc));
  }

    async getStats(): Promise<{
    totalServices: number;
    activeServices: number;
    servicesByCategory: Record<string, number>;
  }> {
    const totalServices = await ServiceModel.countDocuments();
    const activeServices = await ServiceModel.countDocuments({ isActive: true });
    
    const servicesByCategoryAgg = await ServiceModel.aggregate([
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
  }

  async save(service: Service): Promise<Service> {
    const serviceDoc = new ServiceModel(this.toDocument(service));
    const saved = await serviceDoc.save();
    return this.toEntity(saved);
  }

  async update(service: Service): Promise<void> {
    await ServiceModel.findByIdAndUpdate(service.id, this.toDocument(service));
  }

  async delete(id: string): Promise<void> {
    await ServiceModel.findByIdAndUpdate(id, { 
      isActive: false, 
      updatedAt: new Date() 
    });
  }

  async searchServices(query: string): Promise<Service[]> {
    const serviceDocs = await ServiceModel.find({
      $text: { $search: query },
      isActive: true
    })
    .sort({ score: { $meta: 'textScore' } }) 
    .exec();
    
    return serviceDocs.map(doc => this.toEntity(doc));
  }

  async getServiceStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
    priceRange: { min: number; max: number; average: number };
  }> {
    const total = await ServiceModel.countDocuments();
    const active = await ServiceModel.countDocuments({ isActive: true });
    
    const byCategoryAgg = await ServiceModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const byCategory: Record<string, number> = {};
    byCategoryAgg.forEach(item => {
      byCategory[item._id] = item.count;
    });

    const priceStats = await ServiceModel.aggregate([
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
  }

  async reactivate(id: string): Promise<void> {
    await ServiceModel.findByIdAndUpdate(id, { 
      isActive: true, 
      updatedAt: new Date() 
    });
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

  private toDocument(service: Service): any {
    return {
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}