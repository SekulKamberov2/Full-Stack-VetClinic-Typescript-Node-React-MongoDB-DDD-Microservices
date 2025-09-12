import { Payment, PaymentProps, PaymentStatus } from '../../domain/entities/Payment';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { PaymentModel } from './models/PaymentModel';  
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoPaymentRepository implements PaymentRepository {
  private model: typeof PaymentModel;

  constructor() {
    this.model = PaymentModel;
  }

  async findById(id: string): Promise<Payment | null> {
    try {
      const paymentDoc = await this.model.findById(id).exec();
      return paymentDoc ? this.toEntity(paymentDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    try {
      const paymentDocs = await this.model.find({ invoiceId }).exec();
      return paymentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByInvoiceId');
    }
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    try {
      const paymentDocs = await this.model.find({ status }).exec();
      return paymentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByStatus');
    }
  }

  async findByClientId(clientId: string): Promise<Payment[]> {
    try {
      const paymentDocs = await this.model.find({ clientId }).exec();
      return paymentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByClientId');
    }
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    try {
      const paymentDoc = await this.model.findOne({ transactionId }).exec();
      return paymentDoc ? this.toEntity(paymentDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findByTransactionId');
    }
  }

  async save(payment: Payment): Promise<Payment> {  
    try {
      if (!payment.id || payment.id === '') {
        const document = this.toDocument(payment);   
        const paymentDoc = new this.model(document);
        const savedDoc = await paymentDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        payment.id,
        this.toDocument(payment),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Payment with ID ${payment.id} not found`,
          undefined,
          'PaymentRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  } 

  async update(payment: Payment): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        payment.id,
        this.toDocument(payment),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Payment with ID ${payment.id} not found`,
          undefined,
          'PaymentRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async updateStatus(id: string, status: PaymentStatus, failureReason?: string): Promise<void> {
    try {
      const updateData: any = { status };
      if (failureReason) {
        updateData.failureReason = failureReason;
      }

      const result = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Payment with ID ${id} not found`,
          undefined,
          'PaymentRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'updateStatus');
    }
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    try {
      const filter: any = { status: PaymentStatus.SUCCEEDED };
      
      if (startDate || endDate) {
        filter.processedAt = {};
        if (startDate) filter.processedAt.$gte = startDate;
        if (endDate) filter.processedAt.$lte = endDate;
      }

      const result = await this.model.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).exec();

      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      this.handleDatabaseError(error, 'getTotalRevenue');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'exists');
    }
  }

  async existsByTransactionId(transactionId: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({ transactionId }).exec();
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'existsByTransactionId');
    }
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    try {
      const paymentDocs = await this.model.find({
        processedAt: { $gte: startDate, $lte: endDate }
      }).exec();
      
      return paymentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'getPaymentsByDateRange');
    }
  }

  async getRevenueByPaymentMethod(): Promise<Record<string, number>> {
    try {
      const result = await this.model.aggregate([
        { $match: { status: PaymentStatus.SUCCEEDED } },
        { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } }
      ]).exec();

      const revenueByMethod: Record<string, number> = {};
      result.forEach(item => {
        revenueByMethod[item._id] = item.total;
      });

      return revenueByMethod;
    } catch (error) {
      this.handleDatabaseError(error, 'getRevenueByPaymentMethod');
    }
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

  private toDocument(payment: Payment): Partial<any> {
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

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoPaymentRepository.${operation}`;
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ValidationError(
        `Database validation failed: ${error.message}`,
        error,
        context
      );
    }
    
    if (error instanceof Error && error.name === 'CastError') {
      throw new ValidationError(
        'Invalid ID format',
        error,
        context
      );
    }
    
    if (this.isDuplicateKeyError(error)) {
      throw new AppError(
        'Duplicate payment detected (transaction ID may already exist)',
        'DUPLICATE_PAYMENT',
        error,
        context
      );
    }
    
    throw new AppError(
      `Database operation failed: ${operation}`,
      'DATABASE_OPERATION_FAILED',
      error,
      context
    );
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return error instanceof Error && 
           'code' in error && 
           error.code === 11000;
  }
}
