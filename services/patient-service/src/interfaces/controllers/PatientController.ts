import { Request, Response } from 'express';
import { CreatePatientUseCase } from '../../application/use-cases/Patients/CreatePatientUseCase';
import { GetPatientUseCase } from '../../application/use-cases/Patients/GetPatientUseCase';
import { UpdatePatientUseCase } from '../../application/use-cases/Patients/UpdatePatientUseCase';
import { DeletePatientUseCase } from '../../application/use-cases/Patients/DeletePatientUseCase';
import { GetAllPatientsUseCase } from '../../application/use-cases/Patients/GetAllPatientsUseCase';
import { GetPatientsByOwnerUseCase } from '../../application/use-cases/Patients/GetPatientsByOwnerUseCase';
import { SearchPatientsUseCase } from '../../application/use-cases/Patients/SearchPatientsUseCase';
import { GetPatientStatsUseCase } from '../../application/use-cases/Patients/GetPatientStatsUseCase';
import { GetPatientWithDetailsByOwnerUseCase } from '../../application/use-cases/Patients/GetPatientWithDetailsByOwnerUseCase';
import { Patient } from '../../domain/entities/Patient';
import { Allergy } from '../../domain/entities/Allergy';
import { MedicalAlert } from '../../domain/entities/MedicalAlert';
import { PatientNote } from '../../domain/entities/PatientNote';
import { VaccinationRecord } from '../../domain/entities/VaccinationRecord';
import { Visit } from '../../domain/entities/Visit';

export class PatientController {
  constructor(
    private createPatientUseCase: CreatePatientUseCase,
    private getPatientUseCase: GetPatientUseCase,
    private updatePatientUseCase: UpdatePatientUseCase,
    private deletePatientUseCase: DeletePatientUseCase,
    private getAllPatientsUseCase: GetAllPatientsUseCase,
    private getPatientsByOwnerUseCase: GetPatientsByOwnerUseCase,
    private searchPatientsUseCase: SearchPatientsUseCase,
    private getPatientStatsUseCase: GetPatientStatsUseCase,
    private getPatientWithDetailsByOwnerUseCase: GetPatientWithDetailsByOwnerUseCase
  ) {}

  async createPatient(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createPatientUseCase.execute(req.body);
      
      if (result.wasExisting) {
        res.status(200).json({
          success: true,
          message: 'Patient already exists and was returned',
          data: result.patient,
        });
      } else {
        res.status(201).json({
          success: true,
          message: 'Patient created successfully',
          data: result.patient,
        });
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.code || 'VALIDATION_ERROR',
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

  async updatePatient(req: Request, res: Response): Promise<void> {
    try {
      const patient = await this.updatePatientUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: patient,
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

  async deletePatient(req: Request, res: Response): Promise<void> {
    try {
      await this.deletePatientUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Patient deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json({
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

  async searchPatients(req: Request, res: Response): Promise<void> {
    try {
      const { q, ownerId } = req.query;
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const patients = await this.searchPatientsUseCase.execute(
        q, 
        ownerId as string | undefined
      );
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

  async getPatientStats(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.query;
      const stats = await this.getPatientStatsUseCase.execute(ownerId as string | undefined);
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
 
  async getPatientWithDetailsByOwner(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId, patientId } = req.params;

      if (!ownerId || !patientId) {
        res.status(400).json({
          success: false,
          error: 'Owner ID and Patient ID are required'
        });
        return;
      }

      const result = await this.getPatientWithDetailsByOwnerUseCase.execute(ownerId, patientId);

      res.status(200).json({
        success: true,
        data: {
          patient: this.toPatientResponse(result.patient),
          allergies: result.allergies.map((allergy: Allergy) => this.toAllergyResponse(allergy)),
          medicalAlerts: result.medicalAlerts.map((alert: MedicalAlert) => this.toMedicalAlertResponse(alert)),
          patientNotes: result.patientNotes.map((note: PatientNote) => this.toPatientNoteResponse(note)),
          vaccinationRecords: result.vaccinationRecords.map((vaccination: VaccinationRecord) => this.toVaccinationResponse(vaccination)),
          visits: result.visits.map((visit: Visit) => this.toVisitResponse(visit))
        }
      });
    } catch (error: any) {
      console.error('Error fetching patient with details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch patient details',
        message: error.message
      });
    }
  }
 
  private toPatientResponse(patient: Patient): any {
    return {
      id: patient.id,
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      dateOfBirth: patient.dateOfBirth,
      color: patient.color,
      sex: patient.sex,
      microchipNumber: patient.microchipNumber,
      profilePictureUrl: patient.profilePictureUrl,
      status: patient.status,
      ownerId: patient.ownerId,
      medicalAlerts: patient.medicalAlerts,
      isActive: patient.isActive,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    };
  }

  private toAllergyResponse(allergy: Allergy): any {
    return {
      id: allergy.id,
      patientId: allergy.patientId,
      allergen: allergy.allergen,
      reaction: allergy.reaction,
      severity: allergy.severity,
      firstObserved: allergy.firstObserved,
      isActive: allergy.isActive,
      notes: allergy.notes,
      createdAt: allergy.createdAt,
      updatedAt: allergy.updatedAt
    };
  }

  private toMedicalAlertResponse(alert: MedicalAlert): any {
    return {
      id: alert.id,
      patientId: alert.patientId,
      alertText: alert.alertText,
      severity: alert.severity,
      createdBy: alert.createdBy,
      dateCreated: alert.dateCreated,
      isActive: alert.isActive,
      notes: alert.notes,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt
    };
  }

  private toPatientNoteResponse(note: PatientNote): any {
    return {
      id: note.id,
      patientId: note.patientId,
      weight: note.weight,
      noteText: note.noteText,
      authorId: note.authorId,
      dateCreated: note.dateCreated,
      noteType: note.noteType,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    };
  }

  private toVaccinationResponse(vaccination: VaccinationRecord): any {
    return {
      id: vaccination.id,
      patientId: vaccination.patientId,
      vaccineName: vaccination.vaccineName,
      dateAdministered: vaccination.dateAdministered,
      nextDueDate: vaccination.nextDueDate,
      administeredBy: vaccination.administeredBy,
      lotNumber: vaccination.lotNumber,
      manufacturer: vaccination.manufacturer,
      notes: vaccination.notes,
      createdAt: vaccination.createdAt,
      updatedAt: vaccination.updatedAt,
      isDue: vaccination.isDue(),
      isOverdue: vaccination.isOverdue()
    };
  }

  private toVisitResponse(visit: Visit): any {
    return {
      id: visit.id,
      patientId: visit.patientId,
      scheduledDateTime: visit.scheduledDateTime,
      actualDateTime: visit.actualDateTime,
      status: visit.status,
      type: visit.type,
      chiefComplaint: visit.chiefComplaint,
      assignedVeterinarianId: visit.assignedVeterinarianId,
      checkinTime: visit.checkinTime,
      checkoutTime: visit.checkoutTime,
      notes: visit.notes,
      diagnosis: visit.diagnosis,
      treatment: visit.treatment,
      createdAt: visit.createdAt,
      updatedAt: visit.updatedAt
    }; 
  }
}
