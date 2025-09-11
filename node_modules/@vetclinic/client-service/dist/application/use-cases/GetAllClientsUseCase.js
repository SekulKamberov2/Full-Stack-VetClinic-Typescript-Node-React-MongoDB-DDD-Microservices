"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllClientsUseCase = void 0;
class GetAllClientsUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute() {
        return this.clientRepository.findAll();
    }
}
exports.GetAllClientsUseCase = GetAllClientsUseCase;
