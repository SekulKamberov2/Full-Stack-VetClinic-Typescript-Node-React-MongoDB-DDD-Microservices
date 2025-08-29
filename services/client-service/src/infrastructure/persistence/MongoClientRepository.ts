import { Client, ClientProps } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientModel } from '../persistence/models/ClientModel';

export class MongoClientRepository implements ClientRepository {
  async findById(id: string): Promise<Client | null> {
    try { 
      const clientDoc = await ClientModel.findById(id).exec();
      return clientDoc ? this.toEntity(clientDoc) : null;
    } catch (error) { 
      const clientDoc = await ClientModel.findOne({ _id: id }).exec();
      return clientDoc ? this.toEntity(clientDoc) : null;
    }
  }

  async findByEmail(email: string): Promise<Client | null> {
    const clientDoc = await ClientModel.findOne({ email }).exec();
    return clientDoc ? this.toEntity(clientDoc) : null;
  }

  async findAll(): Promise<Client[]> {
    const clientDocs = await ClientModel.find({ isActive: true }).exec();
    return clientDocs.map(doc => this.toEntity(doc));
  }

  async save(client: Client): Promise<Client> {
    const clientDoc = new ClientModel(this.toDocument(client));
    await clientDoc.save(); 
    return this.toEntity(clientDoc);
  }

  async update(client: Client): Promise<void> {
    await ClientModel.findByIdAndUpdate(client.id, this.toDocument(client), { new: true });
  }

  async delete(id: string): Promise<void> {
    await ClientModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
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

  private toDocument(client: Client): any {  
    return {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}