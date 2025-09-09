import { Request, Response } from 'express';
import { GetPatientsByOwnerUseCase } from '../../application/use-cases/GetPatientsByOwnerUseCase';
import { CreatePatientUseCase } from '../../application/use-cases/CreatePatientUseCase';
import { GetPatientUseCase } from '../../application/use-cases/GetPatientUseCase';
import { GetAllPatientsUseCase } from '../../application/use-cases/GetAllPatientsUseCase';
import { UpdatePatientUseCase } from '../../application/use-cases/UpdatePatientUseCase';
import { DeletePatientUseCase } from '../../application/use-cases/DeletePatientUseCase';

export class PatientController {
  constructor(
    private getPatientsByOwnerUseCase: GetPatientsByOwnerUseCase,
    private createPatientUseCase: CreatePatientUseCase,
    private getPatientUseCase: GetPatientUseCase,
    private getAllPatientsUseCase: GetAllPatientsUseCase,
    private updatePatientUseCase: UpdatePatientUseCase,
    private deletePatientUseCase: DeletePatientUseCase
  ) {}

  async getPatientsByOwner(req: Request, res: Response): Promise<void> {
    try {
      const patients = await this.getPatientsByOwnerUseCase.execute(req.params.ownerId);
      res.json({
        success: true,
        data: patients,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createPatient(req: Request, res: Response): Promise<void> {
    try {
        const patient = await this.createPatientUseCase.execute(req.body);
        res.status(201).json({
        success: true,
        data: patient,  
        });
    } catch (error: any) {
        res.status(400).json({
        success: false,
        message: error.message,
        });
    }
  }

  async getPatient(req: Request, res: Response): Promise<void> {
    try {
      const patient = await this.getPatientUseCase.execute(req.params.id);
      if (!patient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
        return;
      }
      res.json({
        success: true,
        data: patient,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllPatients(req: Request, res: Response): Promise<void> {
    try {
      const patients = await this.getAllPatientsUseCase.execute();
      res.json({
        success: true,
        data: patients,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updatePatient(req: Request, res: Response): Promise<void> {
    try {
      const patient = await this.updatePatientUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: patient,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deletePatient(req: Request, res: Response): Promise<void> {
    try {
      await this.deletePatientUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Patient deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}