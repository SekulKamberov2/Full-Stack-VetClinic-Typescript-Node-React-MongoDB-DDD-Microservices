"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientCreatedEvent = void 0;
class ClientCreatedEvent {
    constructor(aggregateId, payload, occurredOn = new Date()) {
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredOn = occurredOn;
        this.type = 'ClientCreated';
    }
}
exports.ClientCreatedEvent = ClientCreatedEvent;
