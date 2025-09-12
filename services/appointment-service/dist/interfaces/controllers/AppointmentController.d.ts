import { Request, Response } from 'express';
import { CreateAppointmentUseCase } from '../../application/use-cases/CreateAppointmentUseCase';
import { GetAppointmentUseCase } from '../../application/use-cases/GetAppointmentUseCase';
import { GetAppointmentsByVetUseCase } from '../../application/use-cases/GetAppointmentsByVetUseCase';
import { GetAppointmentsByClientUseCase } from '../../application/use-cases/GetAppointmentsByClientUseCase';
import { ConfirmAppointmentUseCase } from '../../application/use-cases/ConfirmAppointmentUseCase';
import { CancelAppointmentUseCase } from '../../application/use-cases/CancelAppointmentUseCase';
import { CompleteAppointmentUseCase } from '../../application/use-cases/CompleteAppointmentUseCase';
import { StartAppointmentUseCase } from '../../application/use-cases/StartAppointmentUseCase';
export declare class AppointmentController {
    private createAppointmentUseCase;
    private getAppointmentUseCase;
    private getAppointmentsByVetUseCase;
    private getAppointmentsByClientUseCase;
    private confirmAppointmentUseCase;
    private cancelAppointmentUseCase;
    private completeAppointmentUseCase;
    private startAppointmentUseCase;
    constructor(createAppointmentUseCase: CreateAppointmentUseCase, getAppointmentUseCase: GetAppointmentUseCase, getAppointmentsByVetUseCase: GetAppointmentsByVetUseCase, getAppointmentsByClientUseCase: GetAppointmentsByClientUseCase, confirmAppointmentUseCase: ConfirmAppointmentUseCase, cancelAppointmentUseCase: CancelAppointmentUseCase, completeAppointmentUseCase: CompleteAppointmentUseCase, startAppointmentUseCase: StartAppointmentUseCase);
    private handleError;
    createAppointment(req: Request, res: Response): Promise<void>;
    getAppointment(req: Request, res: Response): Promise<void>;
    getAppointmentsByVet(req: Request, res: Response): Promise<void>;
    getAppointmentsByClient(req: Request, res: Response): Promise<void>;
    confirmAppointment(req: Request, res: Response): Promise<void>;
    startAppointment(req: Request, res: Response): Promise<void>;
    cancelAppointment(req: Request, res: Response): Promise<void>;
    completeAppointment(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AppointmentController.d.ts.map