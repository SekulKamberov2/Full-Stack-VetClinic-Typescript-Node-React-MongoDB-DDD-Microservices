import { Request, Response } from 'express';
import { CreateClientUseCase } from '../../application/use-cases/CreateClientUseCase';
import { GetClientUseCase } from '../../application/use-cases/GetClientUseCase';
import { GetAllClientsUseCase } from '../../application/use-cases/GetAllClientsUseCase';
import { UpdateClientUseCase } from '../../application/use-cases/UpdateClientUseCase';
import { DeleteClientUseCase } from '../../application/use-cases/DeleteClientUseCase';

export class ClientController {
  constructor(
    private createClientUseCase: CreateClientUseCase,
    private getClientUseCase: GetClientUseCase,
    private getAllClientsUseCase: GetAllClientsUseCase,
    private updateClientUseCase: UpdateClientUseCase,
    private deleteClientUseCase: DeleteClientUseCase
  ) {}

  async createClient(req: Request, res: Response): Promise<void> {
    try {
      const client = await this.createClientUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        data: client,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getClient(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllClients(_req: Request, res: Response): Promise<void> {
    try {
      const clients = await this.getAllClientsUseCase.execute();
      res.json({
        success: true,
        data: clients,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateClient(req: Request, res: Response): Promise<void> {
    try {
      const client = await this.updateClientUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Client updated successfully',
        data: client,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteClient(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteClientUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Client deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}