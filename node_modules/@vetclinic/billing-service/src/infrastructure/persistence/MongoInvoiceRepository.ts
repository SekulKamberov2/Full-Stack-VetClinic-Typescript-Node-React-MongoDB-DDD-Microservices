import { Invoice, InvoiceProps, InvoiceStatus } from '../../domain/entities/Invoice';
import { InvoiceRepository } from '../../domain/repositories/InvoiceRepository';
import { InvoiceModel } from './models/InvoiceModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoInvoiceRepository implements InvoiceRepository {
  private model: typeof InvoiceModel;

  constructor() {
    this.model = InvoiceModel;
  }

  async findById(id: string): Promise<Invoice | null> {
    try {
      const invoiceDoc = await this.model.findById(id).exec();
      return invoiceDoc ? this.toEntity(invoiceDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByClientId(clientId: string): Promise<Invoice[]> {
    try {
      const invoiceDocs = await this.model.find({ clientId }).exec();
      return invoiceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByClientId');
    }
  }

  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    try {
      const invoiceDocs = await this.model.find({ status }).exec();
      return invoiceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByStatus');
    }
  }

  async findAll(): Promise<Invoice[]> {
    try {
      const invoiceDocs = await this.model.find().exec();
      return invoiceDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async save(invoice: Invoice): Promise<Invoice> {
    try {
      if (!invoice.id || invoice.id === '') {
        const invoiceDoc = new this.model(this.toDocument(invoice));
        const savedDoc = await invoiceDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        invoice.id,
        this.toDocument(invoice),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Invoice with ID ${invoice.id} not found`,
          undefined,
          'InvoiceRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(invoice: Invoice): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        invoice.id,
        this.toDocument(invoice),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Invoice with ID ${invoice.id} not found`,
          undefined,
          'InvoiceRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundError(
          `Invoice with ID ${id} not found`,
          undefined,
          'InvoiceRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
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

  private toEntity(doc: any): Invoice {
    const props: InvoiceProps = {
      id: doc._id.toString(),
      clientId: doc.clientId,
      appointmentId: doc.appointmentId,
      items: doc.items,
      totalAmount: doc.totalAmount,
      taxAmount: doc.taxAmount,
      discountAmount: doc.discountAmount,
      finalAmount: doc.finalAmount,
      status: doc.status,
      dueDate: doc.dueDate,
      issuedDate: doc.issuedDate,
      paidDate: doc.paidDate,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
    return Invoice.create(props);
  }

  private toDocument(invoice: Invoice): Partial<any> {
    return {
      clientId: invoice.clientId,
      appointmentId: invoice.appointmentId,
      items: invoice.items,
      totalAmount: invoice.totalAmount,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      finalAmount: invoice.finalAmount,
      status: invoice.status,
      dueDate: invoice.dueDate,
      issuedDate: invoice.issuedDate,
      paidDate: invoice.paidDate,
      notes: invoice.notes,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoInvoiceRepository.${operation}`;
    
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
        'Duplicate invoice detected',
        'DUPLICATE_INVOICE',
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
