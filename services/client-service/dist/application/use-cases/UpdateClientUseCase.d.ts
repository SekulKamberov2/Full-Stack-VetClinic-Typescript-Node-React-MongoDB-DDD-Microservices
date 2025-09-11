import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
export declare class UpdateClientUseCase {
    private clientRepository;
    constructor(clientRepository: ClientRepository);
    execute(id: string, clientData: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
    }>): Promise<Client>;
}
