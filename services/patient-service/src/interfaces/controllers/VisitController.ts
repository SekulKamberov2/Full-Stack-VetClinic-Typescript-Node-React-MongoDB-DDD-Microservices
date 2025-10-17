import { Request, Response } from 'express';
import { CreateVisitUseCase } from '../../application/use-cases/Visits/CreateVisitUseCase';
import { GetVisitUseCase } from '../../application/use-cases/Visits/GetVisitUseCase';
import { UpdateVisitUseCase } from '../../application/use-cases/Visits/UpdateVisitUseCase';
import { DeleteVisitUseCase } from '../../application/use-cases/Visits/DeleteVisitUseCase';
import { GetAllVisitsUseCase } from '../../application/use-cases/Visits/GetAllVisitsUseCase';
import { GetVisitsByPatientUseCase } from '../../application/use-cases/Visits/GetVisitsByPatientUseCase';
import { GetUpcomingVisitsUseCase } from '../../application/use-cases/Visits/GetUpcomingVisitsUseCase';
import { CheckInVisitUseCase } from '../../application/use-cases/Visits/CheckInVisitUseCase';
import { CompleteVisitUseCase } from '../../application/use-cases/Visits/CompleteVisitUseCase';
import { CancelVisitUseCase } from '../../application/use-cases/Visits/CancelVisitUseCase';
import { GetVisitStatsUseCase } from '../../application/use-cases/Visits/GetVisitStatsUseCase';

export class VisitController {
  constructor(
    private createVisitUseCase: CreateVisitUseCase,
    private getVisitUseCase: GetVisitUseCase,
    private updateVisitUseCase: UpdateVisitUseCase,
    private deleteVisitUseCase: DeleteVisitUseCase,
    private getAllVisitsUseCase: GetAllVisitsUseCase,
    private getVisitsByPatientUseCase: GetVisitsByPatientUseCase,
    private getUpcomingVisitsUseCase: GetUpcomingVisitsUseCase,
    private checkInVisitUseCase: CheckInVisitUseCase,
    private completeVisitUseCase: CompleteVisitUseCase,
    private cancelVisitUseCase: CancelVisitUseCase,
    private getVisitStatsUseCase: GetVisitStatsUseCase
  ) {}

  async createVisit(req: Request, res: Response): Promise<void> {
    try {
      const visit = await this.createVisitUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Visit created successfully',
        data: visit,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
    }
  }

  async getVisit(req: Request, res: Response): Promise<void> {
    try {
      const visit = await this.getVisitUseCase.execute(req.params.id);
      if (!visit) {
        res.status(404).json({
          success: false,
          message: 'Visit not found',
        });
        return;
      }
      res.json({
        success: true,
        data: visit,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateVisit(req: Request, res: Response): Promise<void> {
    try {
      const visit = await this.updateVisitUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Visit updated successfully',
        data: visit,
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

  async deleteVisit(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteVisitUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Visit deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllVisits(req: Request, res: Response): Promise<void> {
    try {
      const visits = await this.getAllVisitsUseCase.execute();
      res.json({
        success: true,
        data: visits,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getVisitsByPatient(req: Request, res: Response): Promise<void> {
    try {
      const visits = await this.getVisitsByPatientUseCase.execute(req.params.patientId);
      res.json({
        success: true,
        data: visits,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getUpcomingVisits(req: Request, res: Response): Promise<void> {
    try {
      const { days } = req.query;
      const visitDays = days ? parseInt(days as string) : 7;
      const visits = await this.getUpcomingVisitsUseCase.execute(visitDays);
      res.json({
        success: true,
        data: visits,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async checkInVisit(req: Request, res: Response): Promise<void> {
    try {
      const visit = await this.checkInVisitUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Visit checked in successfully',
        data: visit,
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async completeVisit(req: Request, res: Response): Promise<void> {
    try {
      const { diagnosis, treatment, notes } = req.body;
      const visit = await this.completeVisitUseCase.execute(req.params.id);
      
      res.json({
        success: true,
        message: 'Visit completed successfully',
        data: visit,
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async cancelVisit(req: Request, res: Response): Promise<void> {
    try {
      const visit = await this.cancelVisitUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Visit cancelled successfully',
        data: visit,
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getVisitStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getVisitStatsUseCase.execute();
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
