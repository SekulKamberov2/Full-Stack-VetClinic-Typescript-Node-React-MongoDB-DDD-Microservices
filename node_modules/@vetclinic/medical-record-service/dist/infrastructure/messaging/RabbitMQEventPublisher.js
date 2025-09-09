"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQEventPublisher = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class RabbitMQEventPublisher {
    constructor(rabbitmqUrl, exchangeName = 'medical_record_events') {
        this.rabbitmqUrl = rabbitmqUrl;
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
        this.exchangeName = exchangeName;
        console.log(`RabbitMQ Event Publisher initialized with URL: ${this.rabbitmqUrl}`);
    }
    async connect(retries = 10, delay = 5000) {
        console.log(`Attempting to connect to RabbitMQ with ${retries} retries...`);
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`RabbitMQ connection attempt ${i + 1}/${retries} to: ${this.rabbitmqUrl}`);
                this.connection = await amqplib_1.default.connect(this.rabbitmqUrl);
                this.connection.on('error', (err) => {
                    console.error('RabbitMQ connection error:', err.message);
                    this.isConnected = false;
                });
                this.connection.on('close', () => {
                    console.warn('RabbitMQ connection closed');
                    this.isConnected = false;
                });
                this.channel = await this.connection.createChannel();
                this.channel.on('error', (err) => {
                    console.error('RabbitMQ channel error:', err.message);
                });
                this.channel.on('close', () => {
                    console.warn('RabbitMQ channel closed');
                });
                await this.channel.assertExchange(this.exchangeName, 'topic', {
                    durable: true,
                    autoDelete: false
                });
                this.isConnected = true;
                console.log(`Connected to RabbitMQ successfully on attempt ${i + 1}`);
                console.log(`Exchange '${this.exchangeName}' asserted successfully`);
                return;
            }
            catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                console.error(`RabbitMQ connection failed (attempt ${i + 1}/${retries}):`, error.message);
                await this.cleanup();
                if (i < retries - 1) {
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay = Math.min(delay * 1.5, 30000);
                }
                else {
                    throw new Error(`Failed to connect to RabbitMQ after ${retries} attempts. Last error: ${error.message}`);
                }
            }
        }
    }
    async publish(event) {
        if (!this.channel || !this.isConnected) {
            throw new Error('RabbitMQ channel not initialized or not connected');
        }
        try {
            const messageBuffer = Buffer.from(JSON.stringify({
                ...event,
                occurredOn: event.occurredOn.toISOString(),
                _metadata: {
                    publishedAt: new Date().toISOString(),
                    service: 'medical-record-service'
                }
            }));
            const success = this.channel.publish(this.exchangeName, event.type, messageBuffer, {
                persistent: true,
                contentType: 'application/json',
                timestamp: Date.now()
            });
            if (success) {
                console.log(`Event published: ${event.type} for aggregate: ${event.aggregateId}`);
            }
            else {
                console.warn(`Event may not be delivered: ${event.type} for aggregate: ${event.aggregateId}`);
            }
        }
        catch (error) {
            console.error('Failed to publish event:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.cleanup();
            console.log('Disconnected from RabbitMQ successfully');
        }
        catch (error) {
            console.error('Error during RabbitMQ disconnection:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    async cleanup() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
        }
        catch (error) {
            console.warn('Warning: Error closing channel:', error instanceof Error ? error.message : 'Unknown error');
        }
        try {
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
        }
        catch (error) {
            console.warn('Warning: Error closing connection:', error instanceof Error ? error.message : 'Unknown error');
        }
        this.isConnected = false;
    }
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            hasChannel: this.channel !== null
        };
    }
    async healthCheck() {
        if (!this.isConnected || !this.connection || !this.channel) {
            return false;
        }
        try {
            await this.channel.checkExchange(this.exchangeName);
            return true;
        }
        catch (error) {
            console.warn('RabbitMQ health check failed:', error instanceof Error ? error.message : 'Unknown error');
            return false;
        }
    }
    async ensureConnection(retries = 3, delay = 2000) {
        if (this.isConnected && await this.healthCheck()) {
            return;
        }
        console.log('Reconnecting to RabbitMQ...');
        await this.cleanup();
        await this.connect(retries, delay);
    }
}
exports.RabbitMQEventPublisher = RabbitMQEventPublisher;
//# sourceMappingURL=RabbitMQEventPublisher.js.map