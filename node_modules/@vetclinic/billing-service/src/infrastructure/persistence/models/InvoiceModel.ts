import mongoose, { Schema, Document } from 'mongoose';
import { InvoiceStatus } from '../../../domain/entities/Invoice';

export interface InvoiceDocument extends Document {
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
  status: InvoiceStatus;
  dueDate: Date;
  issuedDate: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<InvoiceDocument>({
  clientId: { type: String, required: true, index: true },
  appointmentId: { type: String, index: true },
  items: [{
    serviceId: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  finalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: Object.values(InvoiceStatus),
    required: true,
    index: true 
  },
  dueDate: { type: Date, required: true },
  issuedDate: { type: Date, default: Date.now },
  paidDate: { type: Date },
  notes: { type: String }
}, {
  timestamps: true
});

invoiceSchema.index({ clientId: 1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });

export const InvoiceModel = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema);