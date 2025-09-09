import { Invoice } from '../../domain/entities/Invoice';
import { InvoiceRepository } from '../../domain/repositories/InvoiceRepository';

export class GetClientInvoicesUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(clientId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.findByClientId(clientId);
  }
}