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
export declare class MedicalRecord {
    readonly id: string;
    readonly patientId: string;
    readonly clientId: string;
    readonly veterinarianId: string;
    readonly appointmentId?: string | undefined;
    readonly notes?: string | undefined;
    readonly diagnoses: Diagnosis[];
    readonly treatments: Treatment[];
    readonly prescriptions: Prescription[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private _domainEvents;
    constructor(props: MedicalRecordProps);
    static create(props: MedicalRecordProps): MedicalRecord;
    get domainEvents(): any[];
    addEvent(event: any): void;
    clearEvents(): void;
    updateNotes(notes: string): MedicalRecord;
    addDiagnosis(diagnosis: Diagnosis): MedicalRecord;
    removeDiagnosis(diagnosisId: string): MedicalRecord;
    addTreatment(treatment: Treatment): MedicalRecord;
    removeTreatment(treatmentId: string): MedicalRecord;
    addPrescription(prescription: Prescription): MedicalRecord;
    removePrescription(prescriptionId: string): MedicalRecord;
    toProps(): MedicalRecordProps;
    hasDiagnoses(): boolean;
    hasTreatments(): boolean;
    hasPrescriptions(): boolean;
    getTotalTreatmentCost(): number;
    getFormattedTotalCost(): string;
    getSummary(): string;
}
//# sourceMappingURL=MedicalRecord.d.ts.map