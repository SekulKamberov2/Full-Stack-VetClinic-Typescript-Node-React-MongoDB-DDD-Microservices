"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Client {
    constructor(props) {
        var _a;
        this.id = props.id || "";
        this.firstName = props.firstName;
        this.lastName = props.lastName;
        this.email = props.email;
        this.phone = props.phone;
        this.address = props.address;
        this.isActive = (_a = props.isActive) !== null && _a !== void 0 ? _a : true;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    static create(props) {
        const client = new Client(props);
        // Domain event: ClientCreatedEvent to be added here
        return client;
    }
    update(props) {
        return new Client({
            ...this,
            ...props,
            updatedAt: new Date(),
        });
    }
    deactivate() {
        return new Client({
            ...this,
            isActive: false,
            updatedAt: new Date(),
        });
    }
    activate() {
        return new Client({
            ...this,
            isActive: true,
            updatedAt: new Date(),
        });
    }
}
exports.Client = Client;
