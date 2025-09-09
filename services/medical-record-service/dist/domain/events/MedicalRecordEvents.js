"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordUpdatedEvent = exports.PrescriptionAddedEvent = exports.TreatmentAddedEvent = exports.DiagnosisAddedEvent = exports.MedicalRecordCreatedEvent = void 0;
class MedicalRecordCreatedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'MedicalRecordCreated';
    }
}
exports.MedicalRecordCreatedEvent = MedicalRecordCreatedEvent;
class DiagnosisAddedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'DiagnosisAdded';
    }
}
exports.DiagnosisAddedEvent = DiagnosisAddedEvent;
class TreatmentAddedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'TreatmentAdded';
    }
}
exports.TreatmentAddedEvent = TreatmentAddedEvent;
class PrescriptionAddedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'PrescriptionAdded';
    }
}
exports.PrescriptionAddedEvent = PrescriptionAddedEvent;
class MedicalRecordUpdatedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'MedicalRecordUpdated';
    }
}
exports.MedicalRecordUpdatedEvent = MedicalRecordUpdatedEvent;
//# sourceMappingURL=MedicalRecordEvents.js.map