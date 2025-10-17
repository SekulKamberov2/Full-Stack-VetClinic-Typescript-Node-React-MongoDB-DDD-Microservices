import { Request, Response } from 'express';
import { CreateVaccinationUseCase } from '../../application/use-cases/Vaccinations/CreateVaccinationUseCase';
import { GetVaccinationUseCase } from '../../application/use-cases/Vaccinations/GetVaccinationUseCase';
import { UpdateVaccinationUseCase } from '../../application/use-cases/Vaccinations/UpdateVaccinationUseCase';
import { DeleteVaccinationUseCase } from '../../application/use-cases/Vaccinations/DeleteVaccinationUseCase';
import { GetAllVaccinationsUseCase } from '../../application/use-cases/Vaccinations/GetAllVaccinationsUseCase';
import { GetVaccinationsByPatientUseCase } from '../../application/use-cases/Vaccinations/GetVaccinationsByPatientUseCase';
import { GetDueVaccinationsUseCase } from '../../application/use-cases/Vaccinations/GetDueVaccinationsUseCase';
import { GetOverdueVaccinationsUseCase } from '../../application/use-cases/Vaccinations/GetOverdueVaccinationsUseCase';
import { GetVaccinationStatsUseCase } from '../../application/use-cases/Vaccinations/GetVaccinationStatsUseCase';

export class VaccinationController {
  constructor(
    private createVaccinationUseCase: CreateVaccinationUseCase,
    private getVaccinationUseCase: GetVaccinationUseCase,
    private updateVaccinationUseCase: UpdateVaccinationUseCase,
    private deleteVaccinationUseCase: DeleteVaccinationUseCase,
    private getAllVaccinationsUseCase: GetAllVaccinationsUseCase,
    private getVaccinationsByPatientUseCase: GetVaccinationsByPatientUseCase,
    private getDueVaccinationsUseCase: GetDueVaccinationsUseCase,
    private getOverdueVaccinationsUseCase: GetOverdueVaccinationsUseCase,
    private getVaccinationStatsUseCase: GetVaccinationStatsUseCase
  ) {}

  async createVaccination(req: Request, res: Response): Promise<void> {
    try {
      const vaccination = await this.createVaccinationUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Vaccination record created successfully',
        data: vaccination,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
    }
  }

  async getVaccination(req: Request, res: Response): Promise<void> {
    try {
      const vaccination = await this.getVaccinationUseCase.execute(req.params.id);
      if (!vaccination) {
        res.status(404).json({
          success: false,
          message: 'Vaccination record not found',
        });
        return;
      }
      res.json({
        success: true,
        data: vaccination,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateVaccination(req: Request, res: Response): Promise<void> {
    try {
      const vaccination = await this.updateVaccinationUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Vaccination record updated successfully',
        data: vaccination,
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

  async deleteVaccination(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteVaccinationUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Vaccination record deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllVaccinations(req: Request, res: Response): Promise<void> {
    try {
      const vaccinations = await this.getAllVaccinationsUseCase.execute();
      res.json({
        success: true,
        data: vaccinations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getVaccinationsByPatient(req: Request, res: Response): Promise<void> {
    try {
      const vaccinations = await this.getVaccinationsByPatientUseCase.execute(req.params.patientId);
      res.json({
        success: true,
        data: vaccinations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDueVaccinations(req: Request, res: Response): Promise<void> {
    try {
      const vaccinations = await this.getDueVaccinationsUseCase.execute();
      res.json({
        success: true,
        data: vaccinations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getOverdueVaccinations(req: Request, res: Response): Promise<void> {
    try {
      const vaccinations = await this.getOverdueVaccinationsUseCase.execute();
      res.json({
        success: true,
        data: vaccinations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getVaccinationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getVaccinationStatsUseCase.execute();
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
