import { Client } from '../entities/Client';

export interface ClientRepository {
  findById(id: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
  save(client: Client): Promise<Client>;   
  update(client: Client): Promise<void>;
  delete(id: string): Promise<void>;
}