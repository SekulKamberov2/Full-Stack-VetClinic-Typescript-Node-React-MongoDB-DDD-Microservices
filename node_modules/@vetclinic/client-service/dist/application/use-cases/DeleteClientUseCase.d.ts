import { ClientRepository } from '../../domain/repositories/ClientRepository';
export declare class DeleteClientUseCase {
    private clientRepository;
    constructor(clientRepository: ClientRepository);
    execute(id: string): Promise<void>;
}
