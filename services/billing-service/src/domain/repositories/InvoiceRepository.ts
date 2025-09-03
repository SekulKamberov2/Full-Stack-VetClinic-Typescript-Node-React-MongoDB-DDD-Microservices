import { Invoice, InvoiceStatus } from '../entities/Invoice';

export interface InvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  findByClientId(clientId: string): Promise<Invoice[]>;
  findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
  findAll(): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
  update(invoice: Invoice): Promise<void>;
  delete(id: string): Promise<void>;
}