import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
export declare class MongoClientRepository implements ClientRepository {
    findById(id: string): Promise<Client | null>;
    findByEmail(email: string): Promise<Client | null>;
    findAll(): Promise<Client[]>;
    save(client: Client): Promise<Client>;
    update(client: Client): Promise<void>;
    delete(id: string): Promise<void>;
    private toEntity;
    private toDocument;
}
