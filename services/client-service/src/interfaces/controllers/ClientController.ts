import { Request, Response } from 'express';
import { CreateClientUseCase } from '../../application/use-cases/CreateClientUseCase';
import { GetClientUseCase } from '../../application/use-cases/GetClientUseCase';
import { GetAllClientsUseCase } from '../../application/use-cases/GetAllClientsUseCase';
import { UpdateClientUseCase } from '../../application/use-cases/UpdateClientUseCase';
import { DeleteClientUseCase } from '../../application/use-cases/DeleteClientUseCase';
import { UpdateClientProfileImageUseCase } from '../../application/use-cases/UpdateClientProfileImageUseCase';
import { AuthenticatedRequest } from '../middleware/auth.middleware'; 
import { PetRepository } from 'src/domain/repositories/PetRepository';

export class ClientController {
  [x: string]: any;
  constructor(
    private createClientUseCase: CreateClientUseCase,
    private getClientUseCase: GetClientUseCase,
    private getAllClientsUseCase: GetAllClientsUseCase,
    private updateClientUseCase: UpdateClientUseCase,
    private deleteClientUseCase: DeleteClientUseCase,
    private updateClientProfileImageUseCase: UpdateClientProfileImageUseCase,
    private petRepository: PetRepository
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

  async updateClientProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const { profileImage } = req.body;
      
      if (!profileImage) {
        res.status(400).json({
          success: false,
          message: 'Profile image is required'
        });
        return;
      }

      const client = await this.updateClientProfileImageUseCase.execute(req.params.id, profileImage);
      
      res.json({
        success: true,
        message: 'Profile image updated successfully',
        data: client,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user!.id;   
      const client = await this.getClientUseCase.execute(clientId);
      
      if (!client) {
        res.status(404).json({
          success: false,
          message: 'Client profile not found',
        });
        return;
      }

      const pets = await this.petRepository.findByClientId(clientId);

      res.json({
        success: true,
        data: {
          id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          profileImage: client.profileImage,
          address: client.address,
          pets: pets,
          isActive: client.isActive,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user!.id;   
      const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'profileImage'];
      const updateData: any = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      if (req.body.email) {
        res.status(400).json({
          success: false,
          message: 'Email cannot be updated via profile. Please contact support.',
        });
        return;
      }

      const client = await this.updateClientUseCase.execute(clientId, updateData);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          profileImage: client.profileImage,
          address: client.address
        }
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user!.id; 
      await this.deleteClientUseCase.execute(clientId);
      
      res.json({
        success: true,
        message: 'Profile deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      res.status(500).json({
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
        const id = req.params.id || req.body.id;
        if (!id) {
          res.status(400).json({
            success: false,
            message: "Client ID is required in URL or body",
          });
          return;
        }

        const client = await this.updateClientUseCase.execute(id, req.body);
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
