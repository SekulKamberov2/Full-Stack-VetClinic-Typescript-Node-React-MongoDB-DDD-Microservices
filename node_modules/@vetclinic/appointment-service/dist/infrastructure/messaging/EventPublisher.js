"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisher = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class EventPublisher {
    constructor(rabbitmqUrl) {
        this.rabbitmqUrl = rabbitmqUrl;
        this.connection = null;
        this.channel = null;
    }
    async connect() {
        this.connection = await amqplib_1.default.connect(this.rabbitmqUrl);
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange('appointment_events', 'topic', { durable: true });
    }
    async publish(event) {
        if (!this.channel) {
            throw new Error('RabbitMQ channel not initialized');
        }
        this.channel.publish('appointment_events', event.type, Buffer.from(JSON.stringify({
            ...event,
            occurredOn: event.occurredOn.toISOString()
        })), { persistent: true });
    }
    async disconnect() {
        if (this.channel)
            await this.channel.close();
        if (this.connection)
            await this.connection.close();
    }
}
exports.EventPublisher = EventPublisher;
//# sourceMappingURL=EventPublisher.js.map