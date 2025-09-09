export interface InvoiceProps {
  id?: string;
  clientId: string;
  appointmentId?: string | undefined; 
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
  issuedDate?: Date | undefined;  
  paidDate?: Date | undefined;  
  notes?: string | undefined;  
  createdAt?: Date | undefined; 
  updatedAt?: Date | undefined; 
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export class Invoice {
  public readonly id: string;
  public readonly clientId: string;
  public readonly appointmentId?: string | undefined; 
  public readonly items: Array<{
    serviceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  public readonly totalAmount: number;
  public readonly taxAmount: number;
  public readonly discountAmount: number;
  public readonly finalAmount: number;
  public readonly status: InvoiceStatus;
  public readonly dueDate: Date;
  public readonly issuedDate: Date;
  public readonly paidDate?: Date | undefined;  
  public readonly notes?: string | undefined;  
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: InvoiceProps) {
    this.id = props.id || "";
    this.clientId = props.clientId;
    this.appointmentId = props.appointmentId;  
    this.items = props.items;
    this.totalAmount = props.totalAmount;
    this.taxAmount = props.taxAmount;
    this.discountAmount = props.discountAmount;
    this.finalAmount = props.finalAmount;
    this.status = props.status;
    this.dueDate = props.dueDate;
    this.issuedDate = props.issuedDate || new Date();
    this.paidDate = props.paidDate;
    this.notes = props.notes;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: InvoiceProps): Invoice {
    return new Invoice(props);
  }

  public updateStatus(status: InvoiceStatus): Invoice {
    return new Invoice({
      ...this,
      status,
      updatedAt: new Date(),
    });
  }

  public markAsPaid(paidDate: Date = new Date()): Invoice {
    return new Invoice({
      ...this,
      status: InvoiceStatus.PAID,
      paidDate,
      updatedAt: new Date(),
    });
  }

  public updateDetails(updateData: Partial<Omit<InvoiceProps, 'id' | 'createdAt'>>): Invoice {
    return new Invoice({
      ...this,
      ...updateData,
      updatedAt: new Date(),
    });
  }
}