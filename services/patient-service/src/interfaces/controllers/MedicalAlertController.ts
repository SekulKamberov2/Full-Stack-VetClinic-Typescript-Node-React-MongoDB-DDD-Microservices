import { Request, Response } from 'express';
import { CreateMedicalAlertUseCase } from '../../application/use-cases/MedicalAlerts/CreateMedicalAlertUseCase';
import { GetMedicalAlertUseCase } from '../../application/use-cases/MedicalAlerts/GetMedicalAlertUseCase';
import { UpdateMedicalAlertUseCase } from '../../application/use-cases/MedicalAlerts/UpdateMedicalAlertUseCase';
import { DeleteMedicalAlertUseCase } from '../../application/use-cases/MedicalAlerts/DeleteMedicalAlertUseCase';
import { GetAllMedicalAlertsUseCase } from '../../application/use-cases/MedicalAlerts/GetAllMedicalAlertsUseCase';
import { GetMedicalAlertsByPatientUseCase } from '../../application/use-cases/MedicalAlerts/GetMedicalAlertsByPatientUseCase';
import { GetActiveMedicalAlertsByPatientUseCase } from '../../application/use-cases/MedicalAlerts/GetActiveMedicalAlertsByPatientUseCase';
import { GetCriticalAlertsUseCase } from '../../application/use-cases/MedicalAlerts/GetCriticalAlertsUseCase';

export class MedicalAlertController {
  constructor(
    private createMedicalAlertUseCase: CreateMedicalAlertUseCase,
    private getMedicalAlertUseCase: GetMedicalAlertUseCase,
    private updateMedicalAlertUseCase: UpdateMedicalAlertUseCase,
    private deleteMedicalAlertUseCase: DeleteMedicalAlertUseCase,
    private getAllMedicalAlertsUseCase: GetAllMedicalAlertsUseCase,
    private getMedicalAlertsByPatientUseCase: GetMedicalAlertsByPatientUseCase,
    private getActiveMedicalAlertsByPatientUseCase: GetActiveMedicalAlertsByPatientUseCase,
    private getCriticalAlertsUseCase: GetCriticalAlertsUseCase
  ) {}

  async createMedicalAlert(req: Request, res: Response): Promise<void> {
    try {
      const alert = await this.createMedicalAlertUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Medical alert created successfully',
        data: alert,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
    }
  }

  async getMedicalAlert(req: Request, res: Response): Promise<void> {
    try {
      const alert = await this.getMedicalAlertUseCase.execute(req.params.id);
      if (!alert) {
        res.status(404).json({
          success: false,
          message: 'Medical alert not found',
        });
        return;
      }
      res.json({
        success: true,
        data: alert,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateMedicalAlert(req: Request, res: Response): Promise<void> {
    try {
      const alert = await this.updateMedicalAlertUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Medical alert updated successfully',
        data: alert,
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

  async deleteMedicalAlert(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteMedicalAlertUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Medical alert deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllMedicalAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await this.getAllMedicalAlertsUseCase.execute();
      res.json({
        success: true,
        data: alerts,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMedicalAlertsByPatient(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await this.getMedicalAlertsByPatientUseCase.execute(req.params.patientId);
      res.json({
        success: true,
        data: alerts,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getActiveMedicalAlertsByPatient(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await this.getActiveMedicalAlertsByPatientUseCase.execute(req.params.patientId);
      res.json({
        success: true,
        data: alerts,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCriticalAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await this.getCriticalAlertsUseCase.execute();
      res.json({
        success: true,
        data: alerts,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
