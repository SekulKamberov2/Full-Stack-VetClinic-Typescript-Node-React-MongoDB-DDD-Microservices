import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { InvoiceRepository } from '../../domain/repositories/InvoiceRepository';
import { EventPublisher } from '../../shared/domain/EventPublisher';
import { RefundIssuedEvent } from '../../domain/events/BillingEvents';

export class RefundPaymentUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private invoiceRepository: InvoiceRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(
    paymentId: string,
    reason: string
  ): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new Error('Only succeeded payments can be refunded');
    }

    payment.markAsRefunded();
    await this.paymentRepository.save(payment);

    const invoice = await this.invoiceRepository.findById(payment.invoiceId);
    if (invoice) { 
      await this.invoiceRepository.save(invoice);
    }

    this.eventPublisher.publish(new RefundIssuedEvent(
      payment.id,
      {
        paymentId: payment.id,
        amount: payment.amount,
        reason
      }
    ));
  }
}