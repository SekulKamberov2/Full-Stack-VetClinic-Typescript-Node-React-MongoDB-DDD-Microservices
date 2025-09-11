import { Request, Response } from 'express';
import { CreateClientUseCase } from '../../application/use-cases/CreateClientUseCase';
import { GetClientUseCase } from '../../application/use-cases/GetClientUseCase';
import { GetAllClientsUseCase } from '../../application/use-cases/GetAllClientsUseCase';
import { UpdateClientUseCase } from '../../application/use-cases/UpdateClientUseCase';
import { DeleteClientUseCase } from '../../application/use-cases/DeleteClientUseCase';
export declare class ClientController {
    private createClientUseCase;
    private getClientUseCase;
    private getAllClientsUseCase;
    private updateClientUseCase;
    private deleteClientUseCase;
    constructor(createClientUseCase: CreateClientUseCase, getClientUseCase: GetClientUseCase, getAllClientsUseCase: GetAllClientsUseCase, updateClientUseCase: UpdateClientUseCase, deleteClientUseCase: DeleteClientUseCase);
    createClient(req: Request, res: Response): Promise<void>;
    getClient(req: Request, res: Response): Promise<void>;
    getAllClients(req: Request, res: Response): Promise<void>;
    updateClient(req: Request, res: Response): Promise<void>;
    deleteClient(req: Request, res: Response): Promise<void>;
}
