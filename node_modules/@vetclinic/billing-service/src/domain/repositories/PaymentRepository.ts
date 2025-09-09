import { Payment } from '../entities/Payment';

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByInvoiceId(invoiceId: string): Promise<Payment[]>;
  findByClientId(clientId: string): Promise<Payment[]>;
  findByStatus(status: string): Promise<Payment[]>;
  updateStatus(id: string, status: string, failureReason?: string): Promise<void>;
  getTotalRevenue(start?: Date, end?: Date): Promise<number>;
  save(payment: Payment): Promise<Payment>; 
}
