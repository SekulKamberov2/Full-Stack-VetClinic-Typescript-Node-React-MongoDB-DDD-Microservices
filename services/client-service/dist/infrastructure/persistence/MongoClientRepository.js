"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoClientRepository = void 0;
const Client_1 = require("../../domain/entities/Client");
const ClientModel_1 = require("../persistence/models/ClientModel");
class MongoClientRepository {
    async findById(id) {
        try {
            const clientDoc = await ClientModel_1.ClientModel.findById(id).exec();
            return clientDoc ? this.toEntity(clientDoc) : null;
        }
        catch (error) {
            const clientDoc = await ClientModel_1.ClientModel.findOne({ _id: id }).exec();
            return clientDoc ? this.toEntity(clientDoc) : null;
        }
    }
    async findByEmail(email) {
        const clientDoc = await ClientModel_1.ClientModel.findOne({ email }).exec();
        return clientDoc ? this.toEntity(clientDoc) : null;
    }
    async findAll() {
        const clientDocs = await ClientModel_1.ClientModel.find({ isActive: true }).exec();
        return clientDocs.map(doc => this.toEntity(doc));
    }
    async save(client) {
        const clientDoc = new ClientModel_1.ClientModel(this.toDocument(client));
        const saved = await clientDoc.save();
        return this.toEntity(saved);
    }
    async update(client) {
        await ClientModel_1.ClientModel.findByIdAndUpdate(client.id, this.toDocument(client), { new: true });
    }
    async delete(id) {
        await ClientModel_1.ClientModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }
    toEntity(doc) {
        const props = {
            id: doc._id.toString(),
            firstName: doc.firstName,
            lastName: doc.lastName,
            email: doc.email,
            phone: doc.phone,
            address: doc.address,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
        return Client_1.Client.create(props);
    }
    toDocument(client) {
        return {
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone,
            address: client.address,
            isActive: client.isActive,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        };
    }
}
exports.MongoClientRepository = MongoClientRepository;
