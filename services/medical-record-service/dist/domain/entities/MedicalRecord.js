"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecord = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class MedicalRecord {
    constructor(props) {
        this._domainEvents = [];
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
    static create(props) {
        if (!props.patientId || props.patientId.trim() === '') {
            throw new shared_kernel_1.ValidationError("Patient ID is required", undefined, 'MedicalRecord validation');
        }
        if (!props.clientId || props.clientId.trim() === '') {
            throw new shared_kernel_1.ValidationError("Client ID is required", undefined, 'MedicalRecord validation');
        }
        if (!props.veterinarianId || props.veterinarianId.trim() === '') {
            throw new shared_kernel_1.ValidationError("Veterinarian ID is required", undefined, 'MedicalRecord validation');
        }
        if (props.notes && props.notes.length > 2000) {
            throw new shared_kernel_1.ValidationError("Notes cannot exceed 2000 characters", undefined, 'MedicalRecord validation');
        }
        return new MedicalRecord(props);
    }
    get domainEvents() {
        return this._domainEvents;
    }
    addEvent(event) {
        this._domainEvents.push(event);
    }
    clearEvents() {
        this._domainEvents = [];
    }
    updateNotes(notes) {
        if (notes && notes.length > 2000) {
            throw new shared_kernel_1.ValidationError("Notes cannot exceed 2000 characters", undefined, 'MedicalRecord validation');
        }
        return new MedicalRecord({
            ...this.toProps(),
            notes,
            updatedAt: new Date(),
        });
    }
    addDiagnosis(diagnosis) {
        if (!diagnosis) {
            throw new shared_kernel_1.ValidationError("Diagnosis cannot be null", undefined, 'MedicalRecord validation');
        }
        if (!diagnosis.description || diagnosis.description.trim() === '') {
            throw new shared_kernel_1.ValidationError("Diagnosis must have a description", undefined, 'MedicalRecord validation');
        }
        return new MedicalRecord({
            ...this.toProps(),
            diagnoses: [...this.diagnoses, diagnosis],
            updatedAt: new Date(),
        });
    }
    removeDiagnosis(diagnosisId) {
        const diagnosisIndex = this.diagnoses.findIndex(d => d.id === diagnosisId);
        if (diagnosisIndex === -1) {
            throw new shared_kernel_1.NotFoundError(`Diagnosis with ID ${diagnosisId} not found`, undefined, 'MedicalRecord operation');
        }
        const updatedDiagnoses = [...this.diagnoses];
        updatedDiagnoses.splice(diagnosisIndex, 1);
        return new MedicalRecord({
            ...this.toProps(),
            diagnoses: updatedDiagnoses,
            updatedAt: new Date(),
        });
    }
    addTreatment(treatment) {
        if (!treatment) {
            throw new shared_kernel_1.ValidationError("Treatment cannot be null", undefined, 'MedicalRecord validation');
        }
        if (!treatment.name || treatment.name.trim() === '') {
            throw new shared_kernel_1.ValidationError("Treatment must have a name", undefined, 'MedicalRecord validation');
        }
        if (!treatment.description || treatment.description.trim() === '') {
            throw new shared_kernel_1.ValidationError("Treatment must have a description", undefined, 'MedicalRecord validation');
        }
        if (treatment.cost < 0) {
            throw new shared_kernel_1.ValidationError("Treatment cost cannot be negative", undefined, 'MedicalRecord validation');
        }
        return new MedicalRecord({
            ...this.toProps(),
            treatments: [...this.treatments, treatment],
            updatedAt: new Date(),
        });
    }
    removeTreatment(treatmentId) {
        const treatmentIndex = this.treatments.findIndex(t => t.id === treatmentId);
        if (treatmentIndex === -1) {
            throw new shared_kernel_1.NotFoundError(`Treatment with ID ${treatmentId} not found`, undefined, 'MedicalRecord operation');
        }
        const updatedTreatments = [...this.treatments];
        updatedTreatments.splice(treatmentIndex, 1);
        return new MedicalRecord({
            ...this.toProps(),
            treatments: updatedTreatments,
            updatedAt: new Date(),
        });
    }
    addPrescription(prescription) {
        if (!prescription) {
            throw new shared_kernel_1.ValidationError("Prescription cannot be null", undefined, 'MedicalRecord validation');
        }
        if (!prescription.medicationName || prescription.medicationName.trim() === '') {
            throw new shared_kernel_1.ValidationError("Prescription must have a medication name", undefined, 'MedicalRecord validation');
        }
        if (!prescription.dosage || prescription.dosage.trim() === '') {
            throw new shared_kernel_1.ValidationError("Prescription must have a dosage", undefined, 'MedicalRecord validation');
        }
        if (prescription.refills < 0) {
            throw new shared_kernel_1.ValidationError("Prescription refills cannot be negative", undefined, 'MedicalRecord validation');
        }
        return new MedicalRecord({
            ...this.toProps(),
            prescriptions: [...this.prescriptions, prescription],
            updatedAt: new Date(),
        });
    }
    removePrescription(prescriptionId) {
        const prescriptionIndex = this.prescriptions.findIndex(p => p.id === prescriptionId);
        if (prescriptionIndex === -1) {
            throw new shared_kernel_1.NotFoundError(`Prescription with ID ${prescriptionId} not found`, undefined, 'MedicalRecord operation');
        }
        const updatedPrescriptions = [...this.prescriptions];
        updatedPrescriptions.splice(prescriptionIndex, 1);
        return new MedicalRecord({
            ...this.toProps(),
            prescriptions: updatedPrescriptions,
            updatedAt: new Date(),
        });
    }
    toProps() {
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
    hasDiagnoses() {
        return this.diagnoses.length > 0;
    }
    hasTreatments() {
        return this.treatments.length > 0;
    }
    hasPrescriptions() {
        return this.prescriptions.length > 0;
    }
    getTotalTreatmentCost() {
        return this.treatments.reduce((total, treatment) => total + treatment.cost, 0);
    }
    getFormattedTotalCost() {
        return `$${this.getTotalTreatmentCost().toFixed(2)}`;
    }
    getSummary() {
        const diagnosisCount = this.diagnoses.length;
        const treatmentCount = this.treatments.length;
        const prescriptionCount = this.prescriptions.length;
        return `Record for patient ${this.patientId} - ${diagnosisCount} diagnoses, ${treatmentCount} treatments, ${prescriptionCount} prescriptions`;
    }
}
exports.MedicalRecord = MedicalRecord;
//# sourceMappingURL=MedicalRecord.js.map