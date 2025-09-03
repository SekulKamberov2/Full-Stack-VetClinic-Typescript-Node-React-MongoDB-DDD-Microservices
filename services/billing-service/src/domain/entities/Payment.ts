export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  DIGITAL_WALLET = 'DIGITAL_WALLET'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}
 
export interface PaymentProps {
  id?: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | undefined; 
  processedAt?: Date;
  failureReason?: string | undefined;  
}

export class Payment {
  public readonly id: string;
  public readonly invoiceId: string;
  public readonly clientId: string;
  public readonly amount: number;
  public readonly paymentMethod: PaymentMethod;
  public readonly status: PaymentStatus;
  public readonly transactionId?: string | undefined;  
  public readonly processedAt: Date;
  public readonly failureReason?: string | undefined;  

  constructor(props: PaymentProps) {
    this.id = props.id || '';
    this.invoiceId = props.invoiceId;
    this.clientId = props.clientId;
    this.amount = props.amount;
    this.paymentMethod = props.paymentMethod;
    this.status = props.status;
    this.transactionId = props.transactionId;
    this.processedAt = props.processedAt || new Date();
    this.failureReason = props.failureReason;
  }
 
  public static create(props: PaymentProps): Payment {
    return new Payment(props);
  }
 
  markAsSucceeded(transactionId: string): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be marked as succeeded');
    }
    (this as any).status = PaymentStatus.SUCCEEDED;
    (this as any).transactionId = transactionId;
  }

  markAsFailed(reason: string): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be marked as failed');
    }
    (this as any).status = PaymentStatus.FAILED;
    (this as any).failureReason = reason;
  }

  markAsRefunded(): void {
    if (this.status !== PaymentStatus.SUCCEEDED) {
      throw new Error('Only succeeded payments can be refunded');
    }
    (this as any).status = PaymentStatus.REFUNDED;
  }
}