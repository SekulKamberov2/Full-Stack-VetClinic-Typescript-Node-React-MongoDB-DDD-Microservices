import { Invoice } from '../../domain/entities/Invoice';
import { InvoiceRepository } from '../../domain/repositories/InvoiceRepository';

export class CreateInvoiceUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(invoiceData: {
    clientId: string;
    appointmentId?: string;
    items: Array<{
      serviceId: string;
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    finalAmount: number;
    status: string;
    dueDate: Date;
    notes?: string;
  }): Promise<Invoice> {
    const invoice = Invoice.create({
      ...invoiceData,
      status: invoiceData.status as any
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);
    return savedInvoice;
  }
}