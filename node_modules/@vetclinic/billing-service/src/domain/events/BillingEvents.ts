export interface DomainEvent {
  type: string;
  aggregateId: string;
  occurredOn: Date;
  payload: any;
}

export class InvoiceCreatedEvent implements DomainEvent {
  readonly type = 'InvoiceCreated';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      clientId: string;
      totalAmount: number;
      finalAmount: number;
      dueDate: Date;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class PaymentSucceededEvent implements DomainEvent {
  readonly type = 'PaymentSucceeded';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      invoiceId: string;
      amount: number;
      paymentMethod: string;
      transactionId: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class PaymentFailedEvent implements DomainEvent {
  readonly type = 'PaymentFailed';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      invoiceId: string;
      amount: number;
      paymentMethod: string;
      failureReason: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class RefundIssuedEvent implements DomainEvent {
  readonly type = 'RefundIssued';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      paymentId: string;
      amount: number;
      reason: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class SubscriptionRenewedEvent implements DomainEvent {
  readonly type = 'SubscriptionRenewed';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      clientId: string;
      planId: string;
      amount: number;
      renewalDate: Date;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}