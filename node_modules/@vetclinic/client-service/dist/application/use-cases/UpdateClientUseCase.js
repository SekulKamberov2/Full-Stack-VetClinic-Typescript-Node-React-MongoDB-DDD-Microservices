"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClientUseCase = void 0;
class UpdateClientUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute(id, clientData) {
        const existingClient = await this.clientRepository.findById(id);
        if (!existingClient) {
            throw new Error('Client not found');
        }
        const updatedClient = existingClient.update(clientData);
        await this.clientRepository.update(updatedClient);
        return updatedClient;
    }
}
exports.UpdateClientUseCase = UpdateClientUseCase;
