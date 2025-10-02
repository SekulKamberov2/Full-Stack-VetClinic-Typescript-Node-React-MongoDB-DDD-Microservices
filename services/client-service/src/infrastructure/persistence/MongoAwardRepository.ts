import { Award, AwardProps } from '../../domain/entities/Award';
import { AwardRepository } from '../../domain/repositories/AwardRepository';
import { AwardModel } from './models/AwardModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoAwardRepository implements AwardRepository {
  private model: typeof AwardModel;

  constructor() {
    this.model = AwardModel;
  }

  async findById(id: string): Promise<Award | null> {
    try {
      const awardDoc = await this.model.findById(id).exec();
      return awardDoc ? this.toEntity(awardDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findAll(): Promise<Award[]> {
    try {
        const awardDocs = await this.model.find({ isValid: true }).exec();
        return awardDocs.map(doc => this.toEntity(doc));
    } catch (error) {
        this.handleDatabaseError(error, 'findAll');
    }
    }

  async findByPetId(petId: string): Promise<Award[]> {
    try {
      const awardDocs = await this.model.find({ petId, isValid: true }).exec();
      return awardDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByPetId');
    }
  }

  async findByClientId(clientId: string): Promise<Award[]> {
    try {
      const awardDocs = await this.model.find({ clientId, isValid: true }).exec();
      return awardDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByClientId');
    }
  }

  async findByCategory(category: string): Promise<Award[]> {
    try {
      const awardDocs = await this.model.find({ category, isValid: true }).exec();
      return awardDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByCategory');
    }
  }

  async findByLevel(level: string): Promise<Award[]> {
    try {
      const awardDocs = await this.model.find({ level, isValid: true }).exec();
      return awardDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByLevel');
    }
  }

  async save(award: Award): Promise<Award> {
    try {
      if (!award._id || award._id === '') {
        const awardDoc = new this.model(this.toDocument(award));
        const savedDoc = await awardDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        award._id,
        this.toDocument(award),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Award with ID ${award._id} not found`,
          undefined,
          'AwardRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(award: Award): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        award._id,
        this.toDocument(award),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Award with ID ${award._id} not found`,
          undefined,
          'AwardRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        id,
        { isValid: false, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Award with ID ${id} not found`,
          undefined,
          'AwardRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
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

  async getAwardStats(): Promise<{
    totalAwards: number;
    awardsByCategory: Record<string, number>;
    awardsByLevel: Record<string, number>;
    totalPointsAwarded: number;
  }> {
    try {
      const totalAwards = await this.model.countDocuments({ isValid: true });
      
      const awardsByCategoryAgg = await this.model.aggregate([
        { $match: { isValid: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      
      const awardsByLevelAgg = await this.model.aggregate([
        { $match: { isValid: true } },
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]);
      
      const totalPointsAgg = await this.model.aggregate([
        { $match: { isValid: true } },
        { $group: { _id: null, totalPoints: { $sum: '$points' } } }
      ]);
      
      const awardsByCategory: Record<string, number> = {};
      awardsByCategoryAgg.forEach(item => {
        awardsByCategory[item._id] = item.count;
      });

      const awardsByLevel: Record<string, number> = {};
      awardsByLevelAgg.forEach(item => {
        awardsByLevel[item._id] = item.count;
      });

      const totalPointsAwarded = totalPointsAgg.length > 0 ? totalPointsAgg[0].totalPoints : 0;

      return {
        totalAwards,
        awardsByCategory,
        awardsByLevel,
        totalPointsAwarded
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getAwardStats');
    }
  }

  private toEntity(doc: any): Award {
    const props: AwardProps = {
      _id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      category: doc.category,
      level: doc.level,
      dateAwarded: doc.dateAwarded,
      points: doc.points,
      imageUrl: doc.imageUrl,
      criteria: doc.criteria,
      petId: doc.petId.toString(),
      clientId: doc.clientId.toString(),
      awardedBy: doc.awardedBy,
      isValid: doc.isValid,
      expirationDate: doc.expirationDate,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return Award.create(props);
  }

  private toDocument(award: Award): Partial<any> {
    return {
      title: award.title,
      description: award.description,
      category: award.category,
      level: award.level,
      dateAwarded: award.dateAwarded,
      points: award.points,
      imageUrl: award.imageUrl,
      criteria: award.criteria,
      petId: award.petId,
      clientId: award.clientId,
      awardedBy: award.awardedBy,
      isValid: award.isValid,
      expirationDate: award.expirationDate,
      metadata: award.metadata,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoAwardRepository.${operation}`;
    
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
        'Duplicate award detected',
        'DUPLICATE_AWARD',
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
