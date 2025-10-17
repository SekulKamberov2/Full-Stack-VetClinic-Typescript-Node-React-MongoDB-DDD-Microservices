import { Request, Response } from 'express';
import { CreateAllergyUseCase } from '../../application/use-cases/Allergies/CreateAllergyUseCase';
import { GetAllergyUseCase } from '../../application/use-cases/Allergies/GetAllergyUseCase';
import { UpdateAllergyUseCase } from '../../application/use-cases/Allergies/UpdateAllergyUseCase';
import { DeleteAllergyUseCase } from '../../application/use-cases/Allergies/DeleteAllergyUseCase';
import { GetAllAllergiesUseCase } from '../../application/use-cases/Allergies/GetAllAllergiesUseCase';
import { GetAllergiesByPatientUseCase } from '../../application/use-cases/Allergies/GetAllergiesByPatientUseCase';
import { GetActiveAllergiesByPatientUseCase } from '../../application/use-cases/Allergies/GetActiveAllergiesByPatientUseCase';

export class AllergyController {
  constructor(
    private createAllergyUseCase: CreateAllergyUseCase,
    private getAllergyUseCase: GetAllergyUseCase,
    private updateAllergyUseCase: UpdateAllergyUseCase,
    private deleteAllergyUseCase: DeleteAllergyUseCase,
    private getAllAllergiesUseCase: GetAllAllergiesUseCase,
    private getAllergiesByPatientUseCase: GetAllergiesByPatientUseCase,
    private getActiveAllergiesByPatientUseCase: GetActiveAllergiesByPatientUseCase
  ) {}

  async createAllergy(req: Request, res: Response): Promise<void> {
    try {
      const allergy = await this.createAllergyUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Allergy created successfully',
        data: allergy,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
    }
  }

  async getAllergy(req: Request, res: Response): Promise<void> {
    try {
      const allergy = await this.getAllergyUseCase.execute(req.params.id);
      if (!allergy) {
        res.status(404).json({
          success: false,
          message: 'Allergy not found',
        });
        return;
      }
      res.json({
        success: true,
        data: allergy,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateAllergy(req: Request, res: Response): Promise<void> {
    try {
      const allergy = await this.updateAllergyUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Allergy updated successfully',
        data: allergy,
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
    }
  }

  async deleteAllergy(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteAllergyUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Allergy deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllAllergies(req: Request, res: Response): Promise<void> {
    try {
      const allergies = await this.getAllAllergiesUseCase.execute();
      res.json({
        success: true,
        data: allergies,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllergiesByPatient(req: Request, res: Response): Promise<void> {
    try {
      const allergies = await this.getAllergiesByPatientUseCase.execute(req.params.patientId);
      res.json({
        success: true,
        data: allergies,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getActiveAllergiesByPatient(req: Request, res: Response): Promise<void> {
    try {
      const allergies = await this.getActiveAllergiesByPatientUseCase.execute(req.params.patientId);
      res.json({
        success: true,
        data: allergies,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
