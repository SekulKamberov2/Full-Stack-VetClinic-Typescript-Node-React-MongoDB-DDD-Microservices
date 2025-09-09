import { Request, Response } from "express";
import { CreateMedicalRecordUseCase } from "../../application/use-cases/CreateMedicalRecordUseCase";
import { GetMedicalRecordByIdUseCase } from "../../application/use-cases/GetMedicalRecordByIdUseCase";
import { GetMedicalRecordsByPatientUseCase } from "../../application/use-cases/GetMedicalRecordByPatientUseCase";
import { GetMedicalRecordsByClientUseCase } from "../../application/use-cases/GetMedicalRecordsByClientUseCase";
import { GetMedicalRecordsByVeterinarianUseCase } from "../../application/use-cases/GetMedicalRecordsByVeterinarianUseCase";
import { GetAllMedicalRecordsUseCase } from "../../application/use-cases/GetAllMedicalRecordsUseCase";
import { UpdateMedicalRecordUseCase } from "../../application/use-cases/UpdateMedicalRecordUseCase";
import { DeleteMedicalRecordUseCase } from "../../application/use-cases/DeleteMedicalRecordUseCase";
import { BaseController, RequestValidator, ValidationError, NotFoundError } from "@vetclinic/shared-kernel";

export class MedicalRecordController extends BaseController {
  constructor(
    private createMedicalRecordUseCase: CreateMedicalRecordUseCase,
    private getMedicalRecordByIdUseCase: GetMedicalRecordByIdUseCase,
    private getRecordsByPatientUseCase: GetMedicalRecordsByPatientUseCase,
    private getRecordsByClientUseCase: GetMedicalRecordsByClientUseCase,
    private getRecordsByVeterinarianUseCase: GetMedicalRecordsByVeterinarianUseCase,
    private getAllMedicalRecordsUseCase: GetAllMedicalRecordsUseCase,
    private updateMedicalRecordUseCase: UpdateMedicalRecordUseCase,
    private deleteMedicalRecordUseCase: DeleteMedicalRecordUseCase
  ) {
    super();
  }
 
  async createMedicalRecord(req: Request, res: Response): Promise<void> {
    try {
      const { 
        patientId, clientId, veterinarianId, appointmentId, notes, 
        diagnoses, treatments, prescriptions 
      } = req.body;

      RequestValidator.validateRequiredParam(patientId, 'patientId', 'MedicalRecordController');
      RequestValidator.validateRequiredParam(clientId, 'clientId', 'MedicalRecordController');
      RequestValidator.validateRequiredParam(veterinarianId, 'veterinarianId', 'MedicalRecordController');

      if (patientId) RequestValidator.validateObjectId(patientId, 'patientId', 'MedicalRecordController');
      if (clientId) RequestValidator.validateObjectId(clientId, 'clientId', 'MedicalRecordController');
      if (veterinarianId) RequestValidator.validateObjectId(veterinarianId, 'veterinarianId', 'MedicalRecordController');
      if (appointmentId) RequestValidator.validateObjectId(appointmentId, 'appointmentId', 'MedicalRecordController');

      const record = await this.createMedicalRecordUseCase.execute({
        patientId, clientId, veterinarianId, appointmentId,
        notes, diagnoses, treatments, prescriptions
      });

      this.handleSuccess(res, {
        message: "Medical record created successfully",
        recordId: record.id,
        record: {
          id: record.id,
          patientId: record.patientId,
          clientId: record.clientId,
          veterinarianId: record.veterinarianId,
          appointmentId: record.appointmentId,
          notes: record.notes,
          diagnoses: record.diagnoses.map(d => ({
            id: d.id,
            description: d.description,
            date: d.date,
            notes: d.notes
          })),
          treatments: record.treatments.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            date: t.date,
            cost: t.cost
          })),
          prescriptions: record.prescriptions.map(p => ({
            id: p.id,
            medicationName: p.medicationName,
            dosage: p.dosage,
            instructions: p.instructions,
            status: p.status
          })),
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        }
      }, 201);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;
      RequestValidator.validateObjectId(recordId, 'recordId', 'MedicalRecordController');

      const requestingUserId = (req as any).user?.id;
      const requestingUserRole = (req as any).user?.role;

      const record = await this.getMedicalRecordByIdUseCase.execute({
        recordId,
        requestingUserId,
        requestingUserRole
      });

      if (!record) {
        throw new NotFoundError(
          `Medical record with ID ${recordId} not found`,
          undefined,
          'MedicalRecordController'
        );
      }

      this.handleSuccess(res, {
        id: record.id,
        patientId: record.patientId,
        clientId: record.clientId,
        veterinarianId: record.veterinarianId,
        appointmentId: record.appointmentId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        notes: record.notes,
        diagnoses: record.diagnoses,
        treatments: record.treatments,
        prescriptions: record.prescriptions
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getByPatientId(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      RequestValidator.validateObjectId(patientId, 'patientId', 'MedicalRecordController');

      const { page, limit } = req.query;
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 50;

      if (pageNumber < 1) {
        throw new ValidationError(
          "Page must be greater than or equal to 1",
          undefined,
          'MedicalRecordController'
        );
      }

      if (limitNumber < 1 || limitNumber > 100) {
        throw new ValidationError(
          "Limit must be between 1 and 100",
          undefined,
          'MedicalRecordController'
        );
      }

      const result = await this.getRecordsByPatientUseCase.execute(patientId, pageNumber, limitNumber);

      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getByClientId(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      RequestValidator.validateObjectId(clientId, 'clientId', 'MedicalRecordController');

      const { page, limit } = req.query;
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 50;

      if (pageNumber < 1) {
        throw new ValidationError(
          "Page must be greater than or equal to 1",
          undefined,
          'MedicalRecordController'
        );
      }

      if (limitNumber < 1 || limitNumber > 100) {
        throw new ValidationError(
          "Limit must be between 1 and 100",
          undefined,
          'MedicalRecordController'
        );
      }

      const result = await this.getRecordsByClientUseCase.execute(
        clientId,
        pageNumber,
        limitNumber
      );

      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getByVeterinarianId(req: Request, res: Response): Promise<void> {
    try {
      const { veterinarianId } = req.params;
      RequestValidator.validateObjectId(veterinarianId, 'veterinarianId', 'MedicalRecordController');

      const { page, limit } = req.query;
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 50;

      if (pageNumber < 1) {
        throw new ValidationError(
          "Page must be greater than or equal to 1",
          undefined,
          'MedicalRecordController'
        );
      }

      if (limitNumber < 1 || limitNumber > 100) {
        throw new ValidationError(
          "Limit must be between 1 and 100",
          undefined,
          'MedicalRecordController'
        );
      }

      const result = await this.getRecordsByVeterinarianUseCase.execute(
        veterinarianId,
        pageNumber,
        limitNumber
      );

      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAllRecords(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, patientId, clientId, veterinarianId, dateFrom, dateTo } = req.query;

      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 50;

      if (pageNumber < 1) {
        throw new ValidationError(
          "Page must be greater than or equal to 1",
          undefined,
          'MedicalRecordController'
        );
      }

      if (limitNumber < 1 || limitNumber > 100) {
        throw new ValidationError(
          "Limit must be between 1 and 100",
          undefined,
          'MedicalRecordController'
        );
      }

      const filters: {
        patientId?: string;
        clientId?: string;
        veterinarianId?: string;
        dateFrom?: Date;
        dateTo?: Date;
      } = {};

      if (patientId) {
        RequestValidator.validateObjectId(patientId as string, 'patientId', 'MedicalRecordController');
        filters.patientId = patientId as string;
      }

      if (clientId) {
        RequestValidator.validateObjectId(clientId as string, 'clientId', 'MedicalRecordController');
        filters.clientId = clientId as string;
      }

      if (veterinarianId) {
        RequestValidator.validateObjectId(veterinarianId as string, 'veterinarianId', 'MedicalRecordController');
        filters.veterinarianId = veterinarianId as string;
      }

      if (dateFrom) {
        const dateFromObj = new Date(dateFrom as string);
        if (isNaN(dateFromObj.getTime())) {
          throw new ValidationError(
            "Invalid dateFrom format. Use ISO date format",
            undefined,
            'MedicalRecordController'
          );
        }
        filters.dateFrom = dateFromObj;
      }

      if (dateTo) {
        const dateToObj = new Date(dateTo as string);
        if (isNaN(dateToObj.getTime())) {
          throw new ValidationError(
            "Invalid dateTo format. Use ISO date format",
            undefined,
            'MedicalRecordController'
          );
        }
        filters.dateTo = dateToObj;
      }

      const options: {
        page: number;
        limit: number;
        filters?: typeof filters;
      } = { page: pageNumber, limit: limitNumber };

      if (Object.keys(filters).length > 0) {
        options.filters = filters;
      }

      const result = await this.getAllMedicalRecordsUseCase.execute(options);

      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateMedicalRecord(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;
      RequestValidator.validateObjectId(recordId, 'recordId', 'MedicalRecordController');

      const { notes, diagnoses, treatments, prescriptions } = req.body;
 
      if (notes === undefined && diagnoses === undefined && 
          treatments === undefined && prescriptions === undefined) {
        throw new ValidationError(
          "No fields provided for update",
          undefined,
          'MedicalRecordController'
        );
      }

      await this.updateMedicalRecordUseCase.execute(recordId, {
        notes,
        diagnoses,
        treatments,
        prescriptions
      });

      this.handleSuccess(res, {
        message: "Medical record updated successfully",
        recordId
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteMedicalRecord(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;
      RequestValidator.validateObjectId(recordId, 'recordId', 'MedicalRecordController');

      await this.deleteMedicalRecordUseCase.execute(recordId);

      this.handleSuccess(res, {
        message: "Medical record deleted successfully",
        recordId
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
