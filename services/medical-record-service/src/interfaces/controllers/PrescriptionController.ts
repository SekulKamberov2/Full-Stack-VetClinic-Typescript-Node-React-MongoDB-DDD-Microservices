import { Request, Response } from "express";
import { AddPrescriptionToRecordUseCase } from "../../application/use-cases/AddPrescriptionToRecordUseCase";
import { GetPrescriptionsByRecordUseCase } from "../../application/use-cases/GetPrescriptionsByRecordUseCase";
import { GetPrescriptionByIdUseCase } from "../../application/use-cases/GetPrescriptionByIdUseCase";
import { UpdatePrescriptionUseCase } from "../../application/use-cases/UpdatePrescriptionUseCase";
import { DeletePrescriptionUseCase } from "../../application/use-cases/DeletePrescriptionUseCase";
import { MarkPrescriptionFilledUseCase } from "../../application/use-cases/MarkPrescriptionFilledUseCase";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
import { BaseController, RequestValidator, ValidationError, NotFoundError } from "@vetclinic/shared-kernel";

export class PrescriptionController extends BaseController {
  private addPrescriptionUseCase: AddPrescriptionToRecordUseCase;

  constructor(
    medicalRecordRepository: MedicalRecordRepository,
    prescriptionRepository: PrescriptionRepository,
    private getPrescriptionsByRecordUseCase: GetPrescriptionsByRecordUseCase,
    private getPrescriptionByIdUseCase: GetPrescriptionByIdUseCase,
    private updatePrescriptionUseCase: UpdatePrescriptionUseCase,
    private deletePrescriptionUseCase: DeletePrescriptionUseCase,
    private markPrescriptionFilledUseCase: MarkPrescriptionFilledUseCase
  ) { 
    super();
    this.addPrescriptionUseCase = new AddPrescriptionToRecordUseCase(
      medicalRecordRepository,
      prescriptionRepository
    );
  }

  async addPrescription(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;
      RequestValidator.validateObjectId(recordId, 'recordId', 'PrescriptionController');

      const { medicationName, dosage, instructions, refills, datePrescribed, status } = req.body;
 
      RequestValidator.validateRequiredParam(medicationName, 'medicationName', 'PrescriptionController');
      RequestValidator.validateRequiredParam(dosage, 'dosage', 'PrescriptionController');
      
      if (refills === undefined) {
        throw new ValidationError(
          "refills is required",
          undefined,
          'PrescriptionController'
        );
      }

      if (refills < 0) {
        throw new ValidationError(
          "refills cannot be negative",
          undefined,
          'PrescriptionController'
        );
      }

      const prescription = await this.addPrescriptionUseCase.execute(
        recordId, 
        medicationName,
        dosage,
        instructions || "",
        refills,
        datePrescribed ? new Date(datePrescribed) : undefined,
        status || 'pending'
      );

      this.handleSuccess(res, {
        message: "Prescription added successfully",
        prescriptionId: prescription.id,
        recordId: recordId,
        prescription: prescription
      }, 201);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getByRecordId(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;
      RequestValidator.validateObjectId(recordId, 'recordId', 'PrescriptionController');

      const prescriptions = await this.getPrescriptionsByRecordUseCase.execute(recordId);
      this.handleSuccess(res, prescriptions);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { prescriptionId } = req.params;
      RequestValidator.validateObjectId(prescriptionId, 'prescriptionId', 'PrescriptionController');

      const prescription = await this.getPrescriptionByIdUseCase.execute(prescriptionId);
      
      if (!prescription) {
        throw new NotFoundError(
          `Prescription with ID ${prescriptionId} not found`,
          undefined,
          'PrescriptionController'
        );
      }

      this.handleSuccess(res, prescription);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updatePrescription(req: Request, res: Response): Promise<void> {
    try {
      const { prescriptionId } = req.params;
      RequestValidator.validateObjectId(prescriptionId, 'prescriptionId', 'PrescriptionController');

      const updateData = req.body;
 
      if (updateData.refills !== undefined && updateData.refills < 0) {
        throw new ValidationError(
          "refills cannot be negative",
          undefined,
          'PrescriptionController'
        );
      }

      if (updateData.datePrescribed) {
        const date = new Date(updateData.datePrescribed);
        if (isNaN(date.getTime())) {
          throw new ValidationError(
            "Invalid datePrescribed format",
            undefined,
            'PrescriptionController'
          );
        }
        updateData.datePrescribed = date;
      }

      if (updateData.filledDate) {
        const date = new Date(updateData.filledDate);
        if (isNaN(date.getTime())) {
          throw new ValidationError(
            "Invalid filledDate format",
            undefined,
            'PrescriptionController'
          );
        }
        updateData.filledDate = date;
      }

      await this.updatePrescriptionUseCase.execute(prescriptionId, updateData);

      this.handleSuccess(res, {
        message: "Prescription updated successfully",
        prescriptionId: prescriptionId
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deletePrescription(req: Request, res: Response): Promise<void> {
    try {
      const { prescriptionId } = req.params;
      RequestValidator.validateObjectId(prescriptionId, 'prescriptionId', 'PrescriptionController');
      
      await this.deletePrescriptionUseCase.execute(prescriptionId);

      this.handleSuccess(res, {
        message: "Prescription deleted successfully",
        prescriptionId: prescriptionId
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async markAsFilled(req: Request, res: Response): Promise<void> {
    try {
      const { prescriptionId } = req.params;
      RequestValidator.validateObjectId(prescriptionId, 'prescriptionId', 'PrescriptionController');

      const { filledDate, filledBy } = req.body;

      if (filledBy !== undefined && (!filledBy || filledBy.trim() === '')) {
        throw new ValidationError(
          "filledBy cannot be empty",
          undefined,
          'PrescriptionController'
        );
      }

      await this.markPrescriptionFilledUseCase.execute(
        prescriptionId,
        filledDate ? new Date(filledDate) : new Date(),
        filledBy
      );

      this.handleSuccess(res, {
        message: "Prescription marked as filled",
        prescriptionId: prescriptionId
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
