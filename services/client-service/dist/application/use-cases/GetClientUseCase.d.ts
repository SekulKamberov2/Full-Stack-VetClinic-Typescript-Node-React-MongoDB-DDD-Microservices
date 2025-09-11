import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
export declare class GetClientUseCase {
    private clientRepository;
    constructor(clientRepository: ClientRepository);
    execute(clientId: string): Promise<Client | null>;
}
