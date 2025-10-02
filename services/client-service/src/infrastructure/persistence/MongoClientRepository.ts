import { Client, ClientProps } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientModel } from '../persistence/models/ClientModel';
import { PetModel } from '../persistence/models/PetModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoClientRepository implements ClientRepository {
  private model: typeof ClientModel;

  constructor() {
    this.model = ClientModel;
  }

  async findById(id: string): Promise<Client | null> {
    try {
       console.log('findById findById findById', id)
      const clientDoc = await this.model.findById(id)
        .populate('pets')
        .exec();
      return clientDoc ? this.toEntity(clientDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByEmail(email: string): Promise<Client | null> {
    try {
      const clientDoc = await this.model.findOne({ email })
        .populate('pets')
        .exec();
      return clientDoc ? this.toEntity(clientDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findByEmail');
    }
  }

  async findAll(): Promise<Client[]> {
    try {
      const clientDocs = await this.model.find({ isActive: true })
        .populate('pets')
        .exec();
      return clientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async findAllIncludingInactive(): Promise<Client[]> {
    try {
      const clientDocs = await this.model.find()
        .populate('pets')
        .exec();
      return clientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAllIncludingInactive');
    }
  }
 
  async save(client: Client): Promise<Client> {
  try { 
      const existingClient = await this.model.findById(client._id);
      
      if (!existingClient) { 
        const clientDoc = new this.model({
          ...this.toDocument(client),
          _id: client._id 
        });
        
        const savedDoc = await clientDoc.save();
        
        if (client.pets && client.pets.length > 0) {
          await this.saveClientPets(client._id, client.pets);
          await savedDoc.populate('pets');
        }
        
        return this.toEntity(savedDoc);
      } else { 
        const updatedDoc = await this.model.findByIdAndUpdate(
          client._id,
          this.toDocument(client),
          { new: true, runValidators: true }
        ).populate('pets').exec();
        
        if (!updatedDoc) {
          throw new NotFoundError(
            `Client with ID ${client._id} not found`,
            undefined,
            'ClientRepository'
          );
        }
        
        if (client.pets && client.pets.length > 0) {
          await this.saveClientPets(client._id, client.pets);
          await updatedDoc.populate('pets');
        }
        
        return this.toEntity(updatedDoc);
      }
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
}
 
  async update(client: Client): Promise<void> {
  try {
    const result = await this.model.findByIdAndUpdate(
      client._id,
      this.toDocument(client),
      { new: true, runValidators: true }
    ).exec();
    
    if (!result) {
      throw new NotFoundError(
        `Client with ID ${client._id} not found`,
        undefined,
        'ClientRepository'
      );
    }
     
    if (client.pets && client.pets.length > 0) {
      await this.saveClientPets(client._id, client.pets);
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
      })
      .populate('pets')
      .exec();
      
      return clientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'searchClients');
    }
  }

  async addPet(clientId: string, petData: any): Promise<Client> {
    try {
      const clientDoc = await this.model.findById(clientId);
      if (!clientDoc) {
        throw new NotFoundError(
          `Client with ID ${clientId} not found`,
          undefined,
          'ClientRepository'
        );
      }

      const petDoc = new PetModel({ ...petData, clientId });
      const savedPet = await petDoc.save();
      
      clientDoc.pets.push(savedPet._id);
      await clientDoc.save();
      
      return this.toEntity(await clientDoc.populate('pets'));
    } catch (error) {
      this.handleDatabaseError(error, 'addPet');
    }
  }

  async getClientPets(clientId: string): Promise<any[]> {
    try {
      const clientDoc = await this.model.findById(clientId).populate('pets').exec();
      if (!clientDoc) {
        throw new NotFoundError(
          `Client with ID ${clientId} not found`,
          undefined,
          'ClientRepository'
        );
      }
      return clientDoc.pets;
    } catch (error) {
      this.handleDatabaseError(error, 'getClientPets');
    }
  }

  async updateClientPet(clientId: string, petId: string, petData: any): Promise<Client> {
    try {
      const clientDoc = await this.model.findById(clientId);
      if (!clientDoc) {
        throw new NotFoundError(
          `Client with ID ${clientId} not found`,
          undefined,
          'ClientRepository'
        );
      }

      if (!clientDoc.pets.includes(petId as any)) {
        throw new NotFoundError(
          `Pet with ID ${petId} not found for client ${clientId}`,
          undefined,
          'ClientRepository'
        );
      }

      const updatedPet = await PetModel.findByIdAndUpdate(
        petId,
        petData,
        { new: true, runValidators: true }
      ).exec();

      if (!updatedPet) {
        throw new NotFoundError(
          `Pet with ID ${petId} not found`,
          undefined,
          'ClientRepository'
        );
      }

      return this.toEntity(await clientDoc.populate('pets'));
    } catch (error) {
      this.handleDatabaseError(error, 'updateClientPet');
    }
  }

  async removePetFromClient(clientId: string, petId: string): Promise<Client> {
    try {
      const clientDoc = await this.model.findById(clientId);
      if (!clientDoc) {
        throw new NotFoundError(
          `Client with ID ${clientId} not found`,
          undefined,
          'ClientRepository'
        );
      }

      clientDoc.pets = clientDoc.pets.filter(pet => pet.toString() !== petId);
      await clientDoc.save();

      await PetModel.findByIdAndDelete(petId);

      return this.toEntity(await clientDoc.populate('pets'));
    } catch (error) {
      this.handleDatabaseError(error, 'removePetFromClient');
    }
  }

  async getClientStats(): Promise<{
    totalClients: number;
    activeClients: number;
    clientsByState: Record<string, number>;
    totalPets: number;
    averagePetsPerClient: number;
  }> {
    try {
      const totalClients = await this.model.countDocuments();
      const activeClients = await this.model.countDocuments({ isActive: true });
      const totalPets = await PetModel.countDocuments();
      
      const clientsByStateAgg = await this.model.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$address.state', count: { $sum: 1 } } }
      ]);
      
      const clientsByState: Record<string, number> = {};
      clientsByStateAgg.forEach(item => {
        clientsByState[item._id] = item.count;
      });

      const averagePetsPerClient = totalClients > 0 ? totalPets / totalClients : 0;

      return {
        totalClients,
        activeClients,
        clientsByState,
        totalPets,
        averagePetsPerClient
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getClientStats');
    }
  }

  private toEntity(doc: any): Client {
    const props: ClientProps = {
      _id: doc._id.toString(),   
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone,
      profileImage: doc.profileImage, 
      address: doc.address,
      pets: doc.pets ? doc.pets.map((pet: any) => this.petToEntity(pet)) : [],
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return Client.create(props);
  }

  private petToEntity(petDoc: any): any {
    return {
      _id: petDoc._id.toString(),
      name: petDoc.name,
      species: petDoc.species,
      breed: petDoc.breed,
      age: petDoc.age,
      dateOfBirth: petDoc.dateOfBirth,
      weight: petDoc.weight,
      color: petDoc.color,
      gender: petDoc.gender,
      microchipNumber: petDoc.microchipNumber,
      insuranceNumber: petDoc.insuranceNumber,
      dietaryRestrictions: petDoc.dietaryRestrictions || [],
      vaccinationRecords: petDoc.vaccinationRecords || [],
      awards: petDoc.awards || [],
      isActive: petDoc.isActive,
      clientId: petDoc.clientId?.toString() || petDoc.clientId,
      createdAt: petDoc.createdAt,
      updatedAt: petDoc.updatedAt,
    };
  }

  private toDocument(client: Client): Partial<any> {  
  const doc: any = {
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    profileImage: client.profileImage,
    address: client.address,
    pets: client.pets.map(pet => pet._id), 
    isActive: client.isActive,
    updatedAt: new Date()
  };
 
  if (client._id && client._id !== '') {
    doc._id = client._id;
  }

  return doc;
}

  private async saveClientPets(clientId: string, pets: any[]): Promise<void> {
    for (const pet of pets) {
      if (!pet._id) {
        const petDoc = new PetModel({ ...pet, clientId });
        await petDoc.save();
      } else {
        await PetModel.findByIdAndUpdate(pet._id, pet, { new: true, runValidators: true });
      }
    }
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
