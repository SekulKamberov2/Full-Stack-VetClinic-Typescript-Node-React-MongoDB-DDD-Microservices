"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetClientUseCase = void 0;
class GetClientUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute(clientId) {
        return this.clientRepository.findById(clientId);
    }
}
exports.GetClientUseCase = GetClientUseCase;
