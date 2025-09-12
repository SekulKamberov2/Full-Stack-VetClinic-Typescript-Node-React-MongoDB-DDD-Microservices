"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConsumer = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class EventConsumer {
    constructor(rabbitmqUrl) {
        this.rabbitmqUrl = rabbitmqUrl;
        this.connection = null;
        this.channel = null;
    }
    async connect() {
        this.connection = await amqplib_1.default.connect(this.rabbitmqUrl);
        this.channel = await this.connection.createChannel();
    }
    async consume(queue, onMessage) {
        if (!this.channel) {
            throw new Error('RabbitMQ channel not initialized');
        }
        await this.channel.assertQueue(queue, { durable: true });
        await this.channel.consume(queue, (msg) => {
            if (msg) {
                const content = JSON.parse(msg.content.toString());
                onMessage(content);
                this.channel.ack(msg);
            }
        });
    }
    async disconnect() {
        if (this.channel)
            await this.channel.close();
        if (this.connection)
            await this.connection.close();
    }
}
exports.EventConsumer = EventConsumer;
//# sourceMappingURL=EventConsumer.js.map