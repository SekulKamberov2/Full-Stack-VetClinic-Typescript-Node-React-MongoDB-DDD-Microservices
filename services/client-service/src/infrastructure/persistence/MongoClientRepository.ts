import { Client, ClientProps } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientModel } from '../persistence/models/ClientModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoClientRepository implements ClientRepository {
  private model: typeof ClientModel;

  constructor() {
    this.model = ClientModel;
  }

  async findById(id: string): Promise<Client | null> {
    try {
      const clientDoc = await this.model.findById(id).exec();
      return clientDoc ? this.toEntity(clientDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByEmail(email: string): Promise<Client | null> {
    try {
      const clientDoc = await this.model.findOne({ email }).exec();
      return clientDoc ? this.toEntity(clientDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findByEmail');
    }
  }

  async findAll(): Promise<Client[]> {
    try {
      const clientDocs = await this.model.find({ isActive: true }).exec();
      return clientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async findAllIncludingInactive(): Promise<Client[]> {
    try {
      const clientDocs = await this.model.find().exec();
      return clientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAllIncludingInactive');
    }
  }

  async save(client: Client): Promise<Client> {
    try {
      if (!client.id || client.id === '') {
        const clientDoc = new this.model(this.toDocument(client));
        const savedDoc = await clientDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        client.id,
        this.toDocument(client),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Client with ID ${client.id} not found`,
          undefined,
          'ClientRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(client: Client): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        client.id,
        this.toDocument(client),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Client with ID ${client.id} not found`,
          undefined,
          'ClientRepository'
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
        { isActive: false, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Client with ID ${id} not found`,
          undefined,
          'ClientRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  async reactivate(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        id,
        { isActive: true, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Client with ID ${id} not found`,
          undefined,
          'ClientRepository'
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

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({ email }).exec();
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'existsByEmail');
    }
  }

  async searchClients(query: string): Promise<Client[]> {
    try {
      const clientDocs = await this.model.find({
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ],
        isActive: true
      }).exec();
      
      return clientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'searchClients');
    }
  }

  async getClientStats(): Promise<{
    totalClients: number;
    activeClients: number;
    clientsByState: Record<string, number>;
  }> {
    try {
      const totalClients = await this.model.countDocuments();
      const activeClients = await this.model.countDocuments({ isActive: true });
      
      const clientsByStateAgg = await this.model.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$address.state', count: { $sum: 1 } } }
      ]);
      
      const clientsByState: Record<string, number> = {};
      clientsByStateAgg.forEach(item => {
        clientsByState[item._id] = item.count;
      });

      return {
        totalClients,
        activeClients,
        clientsByState
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getClientStats');
    }
  }

  private toEntity(doc: any): Client {
    const props: ClientProps = {
      id: doc._id.toString(),   
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone,
      address: doc.address,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return Client.create(props);
  }

  private toDocument(client: Client): Partial<any> {  
    return {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      isActive: client.isActive,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoClientRepository.${operation}`;
    
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
        'Duplicate client detected (email may already exist)',
        'DUPLICATE_CLIENT',
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
