import { Request, Response } from 'express';
import { CreateInvoiceUseCase } from '../../application/use-cases/CreateInvoiceUseCase';
import { GetInvoiceUseCase } from '../../application/use-cases/GetInvoiceUseCase';
import { GetClientInvoicesUseCase } from '../../application/use-cases/GetClientInvoicesUseCase';
import { GetAllInvoicesUseCase } from '../../application/use-cases/GetAllInvoicesUseCase'; 

export class InvoiceController {
  constructor(
    private createInvoiceUseCase: CreateInvoiceUseCase,
    private getInvoiceUseCase: GetInvoiceUseCase,
    private getClientInvoicesUseCase: GetClientInvoicesUseCase,
    private getAllInvoicesUseCase: GetAllInvoicesUseCase 
  ) {}

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const invoice = await this.createInvoiceUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async getInvoice(req: Request, res: Response): Promise<void> {
    try {
      const invoice = await this.getInvoiceUseCase.execute(req.params.id);
      if (!invoice) {
        res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
        return;
      }
      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async getClientInvoices(req: Request, res: Response): Promise<void> {
    try {
      const invoices = await this.getClientInvoicesUseCase.execute(req.params.clientId);
      res.json({
        success: true,
        data: invoices
      });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async getAllInvoices(_req: Request, res: Response): Promise<void> {
    try {
      const invoices = await this.getAllInvoicesUseCase.execute();
      res.json({
        success: true,
        data: invoices
      });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }
}