import { Invoice } from '../../domain/entities/Invoice';
import { InvoiceRepository } from '../../domain/repositories/InvoiceRepository';

export class GetAllInvoicesUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(): Promise<Invoice[]> {
    return await this.invoiceRepository.findAll();
  }
}