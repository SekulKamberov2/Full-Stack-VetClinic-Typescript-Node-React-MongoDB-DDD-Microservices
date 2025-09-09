import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus, PaymentMethod } from '../../../domain/entities/Payment';

export interface PaymentDocument extends Document {
  invoiceId: string;
  clientId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  processedAt: Date;
  failureReason?: string;
}

  const paymentSchema = new Schema<PaymentDocument>({
    invoiceId: { type: String, required: true, index: true },
    clientId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      enum: Object.values(PaymentMethod),
      required: true 
    },
    status: { 
      type: String, 
      enum: Object.values(PaymentStatus),
      required: true 
    },
    transactionId: { type: String, unique: true, sparse: true },
    processedAt: { type: Date, default: Date.now, index: true },
    failureReason: { type: String }
  }, {
    timestamps: true
  });
  
  paymentSchema.index({ invoiceId: 1, status: 1 });
  paymentSchema.index({ clientId: 1, processedAt: -1 });
  paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

export const PaymentModel = mongoose.model<PaymentDocument>('Payment', paymentSchema);