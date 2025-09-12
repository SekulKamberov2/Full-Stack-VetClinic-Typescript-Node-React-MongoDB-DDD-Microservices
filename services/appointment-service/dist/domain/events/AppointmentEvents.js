"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentConfirmedEvent = exports.AppointmentCompletedEvent = exports.AppointmentCancelledEvent = exports.AppointmentStartedEvent = exports.AppointmentCreatedEvent = void 0;
class AppointmentCreatedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'AppointmentCreated';
    }
}
exports.AppointmentCreatedEvent = AppointmentCreatedEvent;
class AppointmentStartedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'AppointmentStarted';
    }
}
exports.AppointmentStartedEvent = AppointmentStartedEvent;
class AppointmentCancelledEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'AppointmentCancelled';
    }
}
exports.AppointmentCancelledEvent = AppointmentCancelledEvent;
class AppointmentCompletedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'AppointmentCompleted';
    }
}
exports.AppointmentCompletedEvent = AppointmentCompletedEvent;
class AppointmentConfirmedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'AppointmentConfirmed';
    }
}
exports.AppointmentConfirmedEvent = AppointmentConfirmedEvent;
//# sourceMappingURL=AppointmentEvents.js.map