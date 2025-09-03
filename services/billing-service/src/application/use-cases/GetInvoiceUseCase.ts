import { Invoice } from '../../domain/entities/Invoice';
import { InvoiceRepository } from '../../domain/repositories/InvoiceRepository';

export class GetInvoiceUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(id: string): Promise<Invoice | null> {
    try {
      const invoice = await this.invoiceRepository.findById(id);
      return invoice;
    } catch (error) {
      throw new Error(`Failed to get invoice: ${this.handleError(error)}`);
    }
  }

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}