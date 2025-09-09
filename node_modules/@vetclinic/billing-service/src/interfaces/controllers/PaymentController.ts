import { Request, Response } from 'express';
import { ProcessPaymentUseCase } from '../../application/use-cases/ProcessPaymentUseCase';
import { RefundPaymentUseCase } from '../../application/use-cases/RefundPaymentUseCase';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';

export class PaymentController {
  constructor(
    private processPaymentUseCase: ProcessPaymentUseCase,
    private refundPaymentUseCase: RefundPaymentUseCase,
    private paymentRepository: PaymentRepository
  ) {}

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId, amount, paymentMethod, transactionId } = req.body;
      
      const payment = await this.processPaymentUseCase.execute(
        invoiceId,
        amount,
        paymentMethod,
        transactionId
      );

      res.status(201).json({
        id: payment.id,
        invoiceId: payment.invoiceId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: (payment as any).paymentMethod,
        transactionId: (payment as any).transactionId
      });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(400).json({ error: errorMessage });
    }
  }

  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const payment = await this.paymentRepository.findById(req.params.id);
      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      res.json({
        id: payment.id,
        invoiceId: payment.invoiceId,
        clientId: (payment as any).clientId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: (payment as any).paymentMethod,
        transactionId: (payment as any).transactionId,
        processedAt: (payment as any).processedAt,
        failureReason: (payment as any).failureReason
      });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({ error: errorMessage });
    }
  }

  async getPaymentsByInvoice(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.paymentRepository.findByInvoiceId(req.params.invoiceId);
      res.json(payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: (payment as any).paymentMethod,
        processedAt: (payment as any).processedAt
      })));
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({ error: errorMessage });
    }
  }

  async getPaymentsByClient(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.paymentRepository.findByClientId(req.params.clientId);
      res.json(payments.map(payment => ({
        id: payment.id,
        invoiceId: payment.invoiceId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: (payment as any).paymentMethod,
        processedAt: (payment as any).processedAt
      })));
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({ error: errorMessage });
    }
  }

  async getPaymentsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.paymentRepository.findByStatus(req.params.status as any);
      res.json(payments.map(payment => ({
        id: payment.id,
        invoiceId: payment.invoiceId,
        clientId: (payment as any).clientId,
        amount: payment.amount,
        status: payment.status,
        processedAt: (payment as any).processedAt
      })));
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({ error: errorMessage });
    }
  }

  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, failureReason } = req.body;
      await this.paymentRepository.updateStatus(req.params.id, status, failureReason);
      res.status(200).json({ message: 'Payment status updated successfully' });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(400).json({ error: errorMessage });
    }
  }

  async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const { reason } = req.body;
      await this.refundPaymentUseCase.execute(req.params.id, reason);
      res.status(200).json({ message: 'Refund processed successfully' });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(400).json({ error: errorMessage });
    }
  }

  async getRevenueStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const totalRevenue = await this.paymentRepository.getTotalRevenue(start, end);
      
      res.json({
        totalRevenue,
        currency: 'USD',
        dateRange: {
          start: start?.toISOString(),
          end: end?.toISOString()
        }
      });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({ error: errorMessage });
    }
  }

  async getDailyRevenue(req: Request, res: Response): Promise<void> {
    try {
      const { days = 30 } = req.query;
      const dailyRevenue = await (this.paymentRepository as any).getDailyRevenue(Number(days));
      
      res.json(dailyRevenue);
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({ error: errorMessage });
    }
  }
}