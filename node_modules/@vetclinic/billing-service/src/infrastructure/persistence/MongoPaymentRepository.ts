import { Payment, PaymentProps, PaymentStatus } from '../../domain/entities/Payment';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { PaymentModel } from './models/PaymentModel';  

export class MongoPaymentRepository implements PaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    const paymentDoc = await PaymentModel.findById(id).exec();
    return paymentDoc ? this.toEntity(paymentDoc) : null;
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const paymentDocs = await PaymentModel.find({ invoiceId }).exec();
    return paymentDocs.map(doc => this.toEntity(doc));
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    const paymentDocs = await PaymentModel.find({ status }).exec();
    return paymentDocs.map(doc => this.toEntity(doc));
  }

  async findByClientId(clientId: string): Promise<Payment[]> {
    const paymentDocs = await PaymentModel.find({ clientId }).exec();
    return paymentDocs.map(doc => this.toEntity(doc));
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    const paymentDoc = await PaymentModel.findOne({ transactionId }).exec();
    return paymentDoc ? this.toEntity(paymentDoc) : null;
  }

  async save(payment: Payment): Promise<Payment> {  
    const document = this.toDocument(payment);   
    const paymentDoc = new PaymentModel(document);
    
    const savedDoc = await paymentDoc.save();
    return this.toEntity(savedDoc);
  } 

  async update(payment: Payment): Promise<void> {
    await PaymentModel.findByIdAndUpdate(
      payment.id,
      this.toDocument(payment),
      { new: true, runValidators: true }
    ).exec();
  }

  async updateStatus(id: string, status: PaymentStatus, failureReason?: string): Promise<void> {
    const updateData: any = { status };
    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    await PaymentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).exec();
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    const filter: any = { status: PaymentStatus.SUCCEEDED };
    
    if (startDate || endDate) {
      filter.processedAt = {};
      if (startDate) filter.processedAt.$gte = startDate;
      if (endDate) filter.processedAt.$lte = endDate;
    }

    const result = await PaymentModel.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).exec();

    return result.length > 0 ? result[0].total : 0;
  }

  private toEntity(doc: any): Payment {
    const props: PaymentProps = {
      id: doc._id.toString(), 
      invoiceId: doc.invoiceId,
      clientId: doc.clientId,
      amount: doc.amount,
      paymentMethod: doc.paymentMethod,
      status: doc.status,
      transactionId: doc.transactionId,
      processedAt: doc.processedAt,
      failureReason: doc.failureReason
    }; 
    return Payment.create(props);
  }

  private toDocument(payment: Payment): any {
  const document: any = { 
    invoiceId: payment.invoiceId,
    clientId: payment.clientId,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    status: payment.status,
    transactionId: payment.transactionId,
    processedAt: payment.processedAt,
    failureReason: payment.failureReason
  };  
    if (payment.id && payment.id !== '') {
      document._id = payment.id;
    }
  return document;
}
}