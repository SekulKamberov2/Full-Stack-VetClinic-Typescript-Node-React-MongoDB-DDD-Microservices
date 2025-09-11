"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteClientUseCase = void 0;
class DeleteClientUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute(id) {
        const existingClient = await this.clientRepository.findById(id);
        if (!existingClient) {
            throw new Error('Client not found');
        }
        await this.clientRepository.delete(id);
    }
}
exports.DeleteClientUseCase = DeleteClientUseCase;
