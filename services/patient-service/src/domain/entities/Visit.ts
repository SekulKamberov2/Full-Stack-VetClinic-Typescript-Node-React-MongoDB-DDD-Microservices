export interface VisitProps {
  id?: string;
  patientId: string;
  scheduledDateTime: Date;
  actualDateTime: Date;
  status: VisitStatus;
  type: string;
  chiefComplaint: string;
  assignedVeterinarianId: string;
  checkinTime: Date;
  checkoutTime: Date;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum VisitStatus {
  SCHEDULED = 'scheduled',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class Visit {
  public readonly id: string;
  public readonly patientId: string;
  public readonly scheduledDateTime: Date;
  public readonly actualDateTime: Date;
  public readonly status: VisitStatus;
  public readonly type: string;
  public readonly chiefComplaint: string;
  public readonly assignedVeterinarianId: string;
  public readonly checkinTime: Date;
  public readonly checkoutTime: Date;
  public readonly notes: string;
  public readonly diagnosis: string;
  public readonly treatment: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: VisitProps) {
    this.id = props.id || "";
    this.patientId = props.patientId;
    this.scheduledDateTime = props.scheduledDateTime;
    this.actualDateTime = props.actualDateTime;
    this.status = props.status;
    this.type = props.type;
    this.chiefComplaint = props.chiefComplaint;
    this.assignedVeterinarianId = props.assignedVeterinarianId;
    this.checkinTime = props.checkinTime;
    this.checkoutTime = props.checkoutTime;
    this.notes = props.notes || "";
    this.diagnosis = props.diagnosis || "";
    this.treatment = props.treatment || "";
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: VisitProps): Visit {
    return new Visit(props);
  }

  public update(updateData: Partial<Omit<VisitProps, 'id' | 'createdAt' | 'patientId'>>): Visit {
    return new Visit({
      ...this,
      ...updateData,
      updatedAt: new Date(),
    });
  }

  public checkIn(): Visit {
    return new Visit({
      ...this,
      status: VisitStatus.CHECKED_IN,
      checkinTime: new Date(),
      updatedAt: new Date(),
    });
  }

  public startProgress(): Visit {
    return new Visit({
      ...this,
      status: VisitStatus.IN_PROGRESS,
      updatedAt: new Date(),
    });
  }

  public complete(): Visit {
    return new Visit({
      ...this,
      status: VisitStatus.COMPLETED,
      checkoutTime: new Date(),
      updatedAt: new Date(),
    });
  }

  public cancel(): Visit {
    return new Visit({
      ...this,
      status: VisitStatus.CANCELLED,
      updatedAt: new Date(),
    });
  }

  public addNotes(notes: string): Visit {
    return new Visit({
      ...this,
      notes: notes,
      updatedAt: new Date(),
    });
  }

  public updateDiagnosis(diagnosis: string): Visit {
    return new Visit({
      ...this,
      diagnosis: diagnosis,
      updatedAt: new Date(),
    });
  }

  public updateTreatment(treatment: string): Visit {
    return new Visit({
      ...this,
      treatment: treatment,
      updatedAt: new Date(),
    });
  }
}
