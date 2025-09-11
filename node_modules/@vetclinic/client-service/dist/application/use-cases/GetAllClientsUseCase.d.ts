import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
export declare class GetAllClientsUseCase {
    private clientRepository;
    constructor(clientRepository: ClientRepository);
    execute(): Promise<Client[]>;
}
