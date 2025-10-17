import { Request, Response } from 'express';
import { CreatePatientNoteUseCase } from '../../application/use-cases/PatientNotes/CreatePatientNoteUseCase';
import { GetPatientNoteUseCase } from '../../application/use-cases/PatientNotes/GetPatientNoteUseCase';
import { UpdatePatientNoteUseCase } from '../../application/use-cases/PatientNotes/UpdatePatientNoteUseCase';
import { DeletePatientNoteUseCase } from '../../application/use-cases/PatientNotes/DeletePatientNoteUseCase';
import { GetAllPatientNotesUseCase } from '../../application/use-cases/PatientNotes/GetAllPatientNotesUseCase';
import { GetPatientNotesByPatientUseCase } from '../../application/use-cases/PatientNotes/GetPatientNotesByPatientUseCase';
import { GetRecentPatientNotesUseCase } from '../../application/use-cases/PatientNotes/GetRecentPatientNotesUseCase';

export class PatientNoteController {
  constructor(
    private createPatientNoteUseCase: CreatePatientNoteUseCase,
    private getPatientNoteUseCase: GetPatientNoteUseCase,
    private updatePatientNoteUseCase: UpdatePatientNoteUseCase,
    private deletePatientNoteUseCase: DeletePatientNoteUseCase,
    private getAllPatientNotesUseCase: GetAllPatientNotesUseCase,
    private getPatientNotesByPatientUseCase: GetPatientNotesByPatientUseCase,
    private getRecentPatientNotesUseCase: GetRecentPatientNotesUseCase
  ) {}

  async createPatientNote(req: Request, res: Response): Promise<void> {
    try {
      const note = await this.createPatientNoteUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Patient note created successfully',
        data: note,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
      });
    }
  }

  async getPatientNote(req: Request, res: Response): Promise<void> {
    try {
      const note = await this.getPatientNoteUseCase.execute(req.params.id);
      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Patient note not found',
        });
        return;
      }
      res.json({
        success: true,
        data: note,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updatePatientNote(req: Request, res: Response): Promise<void> {
    try {
      const note = await this.updatePatientNoteUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Patient note updated successfully',
        data: note,
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

  async deletePatientNote(req: Request, res: Response): Promise<void> {
    try {
      await this.deletePatientNoteUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Patient note deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllPatientNotes(req: Request, res: Response): Promise<void> {
    try {
      const notes = await this.getAllPatientNotesUseCase.execute();
      res.json({
        success: true,
        data: notes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPatientNotesByPatient(req: Request, res: Response): Promise<void> {
    try {
      const notes = await this.getPatientNotesByPatientUseCase.execute(req.params.patientId);
      res.json({
        success: true,
        data: notes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getRecentPatientNotes(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const noteLimit = limit ? parseInt(limit as string) : 10;
      const notes = await this.getRecentPatientNotesUseCase.execute(noteLimit);
      res.json({
        success: true,
        data: notes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
