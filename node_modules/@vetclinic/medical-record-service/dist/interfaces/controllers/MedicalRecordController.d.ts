import { Request, Response } from "express";
import { CreateMedicalRecordUseCase } from "../../application/use-cases/CreateMedicalRecordUseCase";
import { GetMedicalRecordByIdUseCase } from "../../application/use-cases/GetMedicalRecordByIdUseCase";
import { GetMedicalRecordsByPatientUseCase } from "../../application/use-cases/GetMedicalRecordByPatientUseCase";
import { GetMedicalRecordsByClientUseCase } from "../../application/use-cases/GetMedicalRecordsByClientUseCase";
import { GetMedicalRecordsByVeterinarianUseCase } from "../../application/use-cases/GetMedicalRecordsByVeterinarianUseCase";
import { GetAllMedicalRecordsUseCase } from "../../application/use-cases/GetAllMedicalRecordsUseCase";
import { UpdateMedicalRecordUseCase } from "../../application/use-cases/UpdateMedicalRecordUseCase";
import { DeleteMedicalRecordUseCase } from "../../application/use-cases/DeleteMedicalRecordUseCase";
export declare class MedicalRecordController {
    private createMedicalRecordUseCase;
    private getMedicalRecordByIdUseCase;
    private getRecordsByPatientUseCase;
    private getRecordsByClientUseCase;
    private getRecordsByVeterinarianUseCase;
    private getAllMedicalRecordsUseCase;
    private updateMedicalRecordUseCase;
    private deleteMedicalRecordUseCase;
    constructor(createMedicalRecordUseCase: CreateMedicalRecordUseCase, getMedicalRecordByIdUseCase: GetMedicalRecordByIdUseCase, getRecordsByPatientUseCase: GetMedicalRecordsByPatientUseCase, getRecordsByClientUseCase: GetMedicalRecordsByClientUseCase, getRecordsByVeterinarianUseCase: GetMedicalRecordsByVeterinarianUseCase, getAllMedicalRecordsUseCase: GetAllMedicalRecordsUseCase, updateMedicalRecordUseCase: UpdateMedicalRecordUseCase, deleteMedicalRecordUseCase: DeleteMedicalRecordUseCase);
    createMedicalRecord(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    getByPatientId(req: Request, res: Response): Promise<void>;
    getByClientId(req: Request, res: Response): Promise<void>;
    getByVeterinarianId(req: Request, res: Response): Promise<void>;
    getAllRecords(req: Request, res: Response): Promise<void>;
    updateMedicalRecord(req: Request, res: Response): Promise<void>;
    deleteMedicalRecord(req: Request, res: Response): Promise<void>;
    private handleError;
}
//# sourceMappingURL=MedicalRecordController.d.ts.map