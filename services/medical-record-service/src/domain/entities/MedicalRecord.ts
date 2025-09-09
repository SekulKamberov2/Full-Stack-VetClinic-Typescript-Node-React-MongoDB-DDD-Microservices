 
import { NotFoundError, ValidationError } from "@vetclinic/shared-kernel"; ;
import { Diagnosis } from "./Diagnosis";
import { Prescription } from "./Prescription";
import { Treatment } from "./Treatment";

export interface MedicalRecordProps {
  id?: string;  
  patientId: string;
  clientId: string;
  veterinarianId: string;
  appointmentId?: string | undefined;  
  notes?: string | undefined;  
  diagnoses?: Diagnosis[];
  treatments?: Treatment[];
  prescriptions?: Prescription[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class MedicalRecord {
  public readonly id: string;
  public readonly patientId: string;
  public readonly clientId: string;
  public readonly veterinarianId: string;
  public readonly appointmentId?: string | undefined;
  public readonly notes?: string | undefined;
  public readonly diagnoses: Diagnosis[];
  public readonly treatments: Treatment[];
  public readonly prescriptions: Prescription[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private _domainEvents: any[] = [];

  constructor(props: MedicalRecordProps) {
    this.id = props.id || "";
    this.patientId = props.patientId;
    this.clientId = props.clientId;
    this.veterinarianId = props.veterinarianId;
    this.appointmentId = props.appointmentId;
    this.notes = props.notes;
    this.diagnoses = props.diagnoses || [];
    this.treatments = props.treatments || [];
    this.prescriptions = props.prescriptions || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: MedicalRecordProps): MedicalRecord { 
    if (!props.patientId || props.patientId.trim() === '') {
      throw new ValidationError("Patient ID is required", undefined, 'MedicalRecord validation');
    }

    if (!props.clientId || props.clientId.trim() === '') {
      throw new ValidationError("Client ID is required", undefined, 'MedicalRecord validation');
    }

    if (!props.veterinarianId || props.veterinarianId.trim() === '') {
      throw new ValidationError("Veterinarian ID is required", undefined, 'MedicalRecord validation');
    }
 
    if (props.notes && props.notes.length > 2000) {
      throw new ValidationError("Notes cannot exceed 2000 characters", undefined, 'MedicalRecord validation');
    }

    return new MedicalRecord(props);
  }

  get domainEvents(): any[] {
    return this._domainEvents;
  }

  public addEvent(event: any) {
    this._domainEvents.push(event);
  }

  public clearEvents() {
    this._domainEvents = [];
  }

  public updateNotes(notes: string): MedicalRecord {
    if (notes && notes.length > 2000) {
      throw new ValidationError("Notes cannot exceed 2000 characters", undefined, 'MedicalRecord validation');
    }

    return new MedicalRecord({
      ...this.toProps(),
      notes,
      updatedAt: new Date(),
    });
  }

  public addDiagnosis(diagnosis: Diagnosis): MedicalRecord {
    if (!diagnosis) {
      throw new ValidationError("Diagnosis cannot be null", undefined, 'MedicalRecord validation');
    }
 
    if (!diagnosis.description || diagnosis.description.trim() === '') {
      throw new ValidationError("Diagnosis must have a description", undefined, 'MedicalRecord validation');
    }

    return new MedicalRecord({
      ...this.toProps(),
      diagnoses: [...this.diagnoses, diagnosis],
      updatedAt: new Date(),
    });
  }

  public removeDiagnosis(diagnosisId: string): MedicalRecord {
    const diagnosisIndex = this.diagnoses.findIndex(d => d.id === diagnosisId);
    
    if (diagnosisIndex === -1) {
      throw new NotFoundError(`Diagnosis with ID ${diagnosisId} not found`, undefined, 'MedicalRecord operation');
    }

    const updatedDiagnoses = [...this.diagnoses];
    updatedDiagnoses.splice(diagnosisIndex, 1);

    return new MedicalRecord({
      ...this.toProps(),
      diagnoses: updatedDiagnoses,
      updatedAt: new Date(),
    });
  }

  public addTreatment(treatment: Treatment): MedicalRecord {
    if (!treatment) {
      throw new ValidationError("Treatment cannot be null", undefined, 'MedicalRecord validation');
    }
 
    if (!treatment.name || treatment.name.trim() === '') {
      throw new ValidationError("Treatment must have a name", undefined, 'MedicalRecord validation');
    }

    if (!treatment.description || treatment.description.trim() === '') {
      throw new ValidationError("Treatment must have a description", undefined, 'MedicalRecord validation');
    }

    if (treatment.cost < 0) {
      throw new ValidationError("Treatment cost cannot be negative", undefined, 'MedicalRecord validation');
    }

    return new MedicalRecord({
      ...this.toProps(),
      treatments: [...this.treatments, treatment],
      updatedAt: new Date(),
    });
  }

  public removeTreatment(treatmentId: string): MedicalRecord {
    const treatmentIndex = this.treatments.findIndex(t => t.id === treatmentId);
    
    if (treatmentIndex === -1) {
      throw new NotFoundError(`Treatment with ID ${treatmentId} not found`, undefined, 'MedicalRecord operation');
    }

    const updatedTreatments = [...this.treatments];
    updatedTreatments.splice(treatmentIndex, 1);

    return new MedicalRecord({
      ...this.toProps(),
      treatments: updatedTreatments,
      updatedAt: new Date(),
    });
  }

  public addPrescription(prescription: Prescription): MedicalRecord {
    if (!prescription) {
      throw new ValidationError("Prescription cannot be null", undefined, 'MedicalRecord validation');
    }
 
    if (!prescription.medicationName || prescription.medicationName.trim() === '') {
      throw new ValidationError("Prescription must have a medication name", undefined, 'MedicalRecord validation');
    }

    if (!prescription.dosage || prescription.dosage.trim() === '') {
      throw new ValidationError("Prescription must have a dosage", undefined, 'MedicalRecord validation');
    }

    if (prescription.refills < 0) {
      throw new ValidationError("Prescription refills cannot be negative", undefined, 'MedicalRecord validation');
    }

    return new MedicalRecord({
      ...this.toProps(),
      prescriptions: [...this.prescriptions, prescription],
      updatedAt: new Date(),
    });
  }

  public removePrescription(prescriptionId: string): MedicalRecord {
    const prescriptionIndex = this.prescriptions.findIndex(p => p.id === prescriptionId);
    
    if (prescriptionIndex === -1) {
      throw new NotFoundError(`Prescription with ID ${prescriptionId} not found`, undefined, 'MedicalRecord operation');
    }

    const updatedPrescriptions = [...this.prescriptions];
    updatedPrescriptions.splice(prescriptionIndex, 1);

    return new MedicalRecord({
      ...this.toProps(),
      prescriptions: updatedPrescriptions,
      updatedAt: new Date(),
    });
  }

  public toProps(): MedicalRecordProps {
    return {
      id: this.id,
      patientId: this.patientId,
      clientId: this.clientId,
      veterinarianId: this.veterinarianId,
      appointmentId: this.appointmentId,
      notes: this.notes,
      diagnoses: this.diagnoses,
      treatments: this.treatments,
      prescriptions: this.prescriptions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
 
  public hasDiagnoses(): boolean {
    return this.diagnoses.length > 0;
  }

  public hasTreatments(): boolean {
    return this.treatments.length > 0;
  }

  public hasPrescriptions(): boolean {
    return this.prescriptions.length > 0;
  }

  public getTotalTreatmentCost(): number {
    return this.treatments.reduce((total, treatment) => total + treatment.cost, 0);
  }

  public getFormattedTotalCost(): string {
    return `$${this.getTotalTreatmentCost().toFixed(2)}`;
  }

  public getSummary(): string {
    const diagnosisCount = this.diagnoses.length;
    const treatmentCount = this.treatments.length;
    const prescriptionCount = this.prescriptions.length;
    
    return `Record for patient ${this.patientId} - ${diagnosisCount} diagnoses, ${treatmentCount} treatments, ${prescriptionCount} prescriptions`;
  }
}
