import { Invoice, InvoiceProps, InvoiceStatus } from '../../domain/entities/Invoice';
import { InvoiceRepository } from '../../domain/repositories/InvoiceRepository';
import { InvoiceModel } from './models/InvoiceModel';

export class MongoInvoiceRepository implements InvoiceRepository {
  async findById(id: string): Promise<Invoice | null> {
    const invoiceDoc = await InvoiceModel.findById(id).exec();
    return invoiceDoc ? this.toEntity(invoiceDoc) : null;
  }

  async findByClientId(clientId: string): Promise<Invoice[]> {
    const invoiceDocs = await InvoiceModel.find({ clientId }).exec();
    return invoiceDocs.map(doc => this.toEntity(doc));
  }

  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    const invoiceDocs = await InvoiceModel.find({ status }).exec();
    return invoiceDocs.map(doc => this.toEntity(doc));
  }

  async findAll(): Promise<Invoice[]> {
    const invoiceDocs = await InvoiceModel.find().exec();
    return invoiceDocs.map(doc => this.toEntity(doc));
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const invoiceDoc = new InvoiceModel(this.toDocument(invoice));
    var saved = await invoiceDoc.save(); 
    return this.toEntity(saved);
  }

  async update(invoice: Invoice): Promise<void> {
    await InvoiceModel.findByIdAndUpdate(invoice.id, this.toDocument(invoice)).exec();
  }

  async delete(id: string): Promise<void> {
    await InvoiceModel.findByIdAndDelete(id).exec();
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

  private toDocument(invoice: Invoice): any {
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
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    };
  }
}