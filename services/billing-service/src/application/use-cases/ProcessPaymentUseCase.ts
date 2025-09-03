import { Payment, PaymentStatus, PaymentMethod } from '../../domain/entities/Payment';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { InvoiceRepository } from '../../domain/repositories/InvoiceRepository';
import { EventPublisher } from '../../shared/domain/EventPublisher';
import { PaymentSucceededEvent, PaymentFailedEvent } from '../../domain/events/BillingEvents';

export class ProcessPaymentUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private invoiceRepository: InvoiceRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(
    invoiceId: string,
    amount: number,
    paymentMethod: string,
    transactionId?: string
  ): Promise<Payment> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
 
    const invoiceFinalAmount = (invoice as any).finalAmount;
    if (Math.abs(amount - invoiceFinalAmount) > 0.01) {
      throw new Error('Payment amount does not match invoice amount');
    }
 
    const payment = Payment.create({ 
      invoiceId,
      clientId: (invoice as any).clientId,
      amount,
      paymentMethod: paymentMethod as PaymentMethod,
      status: PaymentStatus.PENDING,
      processedAt: new Date(),
      transactionId
    });
     
    const isSuccess = await this.simulatePaymentProcessing();
    
    if (isSuccess) {
      payment.markAsSucceeded(transactionId || this.generateTransactionId());
   
      if ((invoice as any).markAsPaid) {
        (invoice as any).markAsPaid(new Date());
      }
      
      const savedPayment = await this.paymentRepository.save(payment);
      console.log('USECASE savedPayment paymentRepository', savedPayment) 
      await this.invoiceRepository.save(invoice);
      
      this.eventPublisher.publish(new PaymentSucceededEvent(
        savedPayment.id,
        {
          invoiceId,
          amount,
          paymentMethod,
          transactionId: transactionId || this.generateTransactionId()
        }
      ));

      return savedPayment;
    } else {
      payment.markAsFailed('Payment processing failed');
      
      const savedPayment = await this.paymentRepository.save(payment);
      
      this.eventPublisher.publish(new PaymentFailedEvent(
        savedPayment.id,
        {
          invoiceId,
          amount,
          paymentMethod,
          failureReason: 'Payment processing failed'
        }
      ));

      return savedPayment;
    }
  }

  private async simulatePaymentProcessing(): Promise<boolean> { 
    return Math.random() > 0.1;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}