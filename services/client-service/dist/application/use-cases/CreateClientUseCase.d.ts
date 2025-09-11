import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
export declare class CreateClientUseCase {
    private clientRepository;
    private eventPublisher;
    constructor(clientRepository: ClientRepository, eventPublisher: EventPublisher);
    execute(clientData: {
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
    }): Promise<Client>;
    private validateClientData;
    private validateAddress;
}
