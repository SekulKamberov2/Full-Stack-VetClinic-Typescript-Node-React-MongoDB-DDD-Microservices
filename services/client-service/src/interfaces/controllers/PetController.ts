import { Request, Response } from 'express'; 
import { GetPetsByClientUseCase } from '../../application/use-cases/pets/GetPetsByClientUseCase';
import { GetPetUseCase } from '../../application/use-cases/pets/GetPetUseCase';
import { DeletePetUseCase } from '../../application/use-cases/pets/DeletePetUseCase';
import { GetAllPetsUseCase } from '../../application/use-cases/pets/GetAllPetsUseCase';
import { CreatePetUseCase } from '../../application/use-cases/pets/CreatePetUseCase';
import { UpdatePetUseCase } from '../../application/use-cases/pets/UpdatePetUseCase';
import { SearchPetsUseCase } from '../../application/use-cases/pets/SearchPetsUseCase';
import { AddVaccinationRecordUseCase } from '../../application/use-cases/pets/AddVaccinationRecordUseCase';
import { CompleteVaccinationUseCase } from '../../application/use-cases/pets/CompleteVaccinationUseCase';
import { GetPetStatsUseCase } from '../../application/use-cases/pets/GetPetStatsUseCase';
import { UpdatePetProfileImageUseCase } from '../../application/use-cases/pets/UpdatePetProfileImageUseCase';

export class PetController {
  constructor(
    private createPetUseCase: CreatePetUseCase,
    private getPetUseCase: GetPetUseCase,
    private getPetsByClientUseCase: GetPetsByClientUseCase,
    private updatePetUseCase: UpdatePetUseCase,
    private deletePetUseCase: DeletePetUseCase,
    private getAllPetsUseCase: GetAllPetsUseCase,
    private searchPetsUseCase: SearchPetsUseCase,
    private addVaccinationRecordUseCase: AddVaccinationRecordUseCase,
    private completeVaccinationUseCase: CompleteVaccinationUseCase,
    private getPetStatsUseCase: GetPetStatsUseCase,
    private updatePetProfileImageUseCase: UpdatePetProfileImageUseCase
  ) {}

async createPet(req: Request, res: Response): Promise<void> {
  try { 
    const { clientId } = req.body;
    
    if (!clientId) {
      res.status(400).json({
        success: false,
        message: "Client ID is required in request body"
      });
      return;
    }

    const petData = { ...req.body };
    const pet = await this.createPetUseCase.execute(petData);
    
    res.status(201).json({
      success: true,
      data: pet,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async updatePetProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const { profileImage } = req.body;
      
      if (!profileImage) {
        res.status(400).json({
          success: false,
          message: 'Profile image is required'
        });
        return;
      }

      const pet = await this.updatePetProfileImageUseCase.execute(req.params.id, profileImage);
      
      res.json({
        success: true,
        message: 'Pet profile image updated successfully',
        data: pet,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPet(req: Request, res: Response): Promise<void> {
    try {
      const pet = await this.getPetUseCase.execute(req.params.id);
      res.json({
        success: true,
        data: pet,
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
  }

  async getClientPets(req: Request, res: Response): Promise<void> {
    try {
      const pets = await this.getPetsByClientUseCase.execute(req.params.clientId);
      res.json({
        success: true,
        data: pets,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updatePet(req: Request, res: Response): Promise<void> {
    try {
      const pet = await this.updatePetUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        data: pet,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deletePet(req: Request, res: Response): Promise<void> {
  try { 
    const petId = req.params.petId || req.params.id; 
    if (!petId) {
      res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
      return;
    }

    await this.deletePetUseCase.execute(petId);
    
    res.json({
      success: true,
      message: 'Pet deleted successfully',
    });
  } catch (error: any) {
    console.error('[PetController.deletePet] Error:', error.message);
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

  async getAllPets(_req: Request, res: Response): Promise<void> {
    try {
      const pets = await this.getAllPetsUseCase.execute();
      res.json({
        success: true,
        data: pets,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchPets(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.params;
      const pets = await this.searchPetsUseCase.execute(query);
      res.json({
        success: true,
        data: pets,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async addVaccinationRecord(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      const vaccinationRecord = req.body;
      const pet = await this.addVaccinationRecordUseCase.execute(petId, vaccinationRecord);
      res.json({
        success: true,
        data: pet,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async completeVaccination(req: Request, res: Response): Promise<void> {
    try {
      const { petId, vaccineId } = req.params;
      const pet = await this.completeVaccinationUseCase.execute(petId, vaccineId);
      res.json({
        success: true,
        data: pet,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPetStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getPetStatsUseCase.execute();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
