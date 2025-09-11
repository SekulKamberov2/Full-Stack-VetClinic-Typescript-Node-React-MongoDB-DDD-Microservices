"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
class ClientController {
    constructor(createClientUseCase, getClientUseCase, getAllClientsUseCase, updateClientUseCase, deleteClientUseCase) {
        this.createClientUseCase = createClientUseCase;
        this.getClientUseCase = getClientUseCase;
        this.getAllClientsUseCase = getAllClientsUseCase;
        this.updateClientUseCase = updateClientUseCase;
        this.deleteClientUseCase = deleteClientUseCase;
    }
    async createClient(req, res) {
        try {
            const client = await this.createClientUseCase.execute(req.body);
            res.status(201).json({
                success: true,
                data: client,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getClient(req, res) {
        try {
            const client = await this.getClientUseCase.execute(req.params.id);
            if (!client) {
                res.status(404).json({
                    success: false,
                    message: 'Client not found',
                });
                return;
            }
            res.json({
                success: true,
                data: client,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getAllClients(req, res) {
        try {
            const clients = await this.getAllClientsUseCase.execute();
            res.json({
                success: true,
                data: clients,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async updateClient(req, res) {
        try {
            const client = await this.updateClientUseCase.execute(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Client updated successfully',
                data: client,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    async deleteClient(req, res) {
        try {
            await this.deleteClientUseCase.execute(req.params.id);
            res.json({
                success: true,
                message: 'Client deleted successfully',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.ClientController = ClientController;
