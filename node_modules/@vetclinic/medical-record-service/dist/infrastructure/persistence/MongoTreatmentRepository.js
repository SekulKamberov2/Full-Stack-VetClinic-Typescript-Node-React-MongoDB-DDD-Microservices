"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoTreatmentRepository = void 0;
const Treatment_1 = require("../../domain/entities/Treatment");
const TreatmentModel_1 = require("./models/TreatmentModel");
class MongoTreatmentRepository {
    async findById(id) {
        const treatmentDoc = await TreatmentModel_1.TreatmentModel.findById(id).exec();
        return treatmentDoc ? this.toEntity(treatmentDoc) : null;
    }
    async findByRecordId(recordId) {
        const treatmentDocs = await TreatmentModel_1.TreatmentModel.find({ recordId })
            .sort({ date: -1 })
            .exec();
        return treatmentDocs.map(doc => this.toEntity(doc));
    }
    async findByName(name) {
        const treatmentDocs = await TreatmentModel_1.TreatmentModel.find({
            name: { $regex: new RegExp(name, 'i') }
        }).exec();
        return treatmentDocs.map(doc => this.toEntity(doc));
    }
    async findByCostRange(minCost, maxCost) {
        const treatmentDocs = await TreatmentModel_1.TreatmentModel.find({
            cost: { $gte: minCost, $lte: maxCost }
        }).exec();
        return treatmentDocs.map(doc => this.toEntity(doc));
    }
    async findByDateRange(startDate, endDate) {
        const treatmentDocs = await TreatmentModel_1.TreatmentModel.find({
            date: { $gte: startDate, $lte: endDate }
        }).exec();
        return treatmentDocs.map(doc => this.toEntity(doc));
    }
    async findAll() {
        const treatmentDocs = await TreatmentModel_1.TreatmentModel.find().exec();
        return treatmentDocs.map(doc => this.toEntity(doc));
    }
    async getStats() {
        const totalTreatments = await TreatmentModel_1.TreatmentModel.countDocuments();
        const costStats = await TreatmentModel_1.TreatmentModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: '$cost' },
                    averageCost: { $avg: '$cost' },
                    minCost: { $min: '$cost' },
                    maxCost: { $max: '$cost' }
                }
            }
        ]);
        const treatmentsByRecordAgg = await TreatmentModel_1.TreatmentModel.aggregate([
            {
                $group: {
                    _id: '$recordId',
                    count: { $sum: 1 }
                }
            }
        ]);
        const treatmentsByRecord = {};
        treatmentsByRecordAgg.forEach(item => {
            treatmentsByRecord[item._id] = item.count;
        });
        const stats = costStats.length > 0 ? costStats[0] : {
            totalCost: 0,
            averageCost: 0,
            minCost: 0,
            maxCost: 0
        };
        return {
            totalTreatments,
            totalCost: stats.totalCost,
            averageCost: stats.averageCost,
            treatmentsByRecord,
            costRange: {
                min: stats.minCost,
                max: stats.maxCost,
                average: stats.averageCost
            }
        };
    }
    async save(treatment) {
        const treatmentDoc = new TreatmentModel_1.TreatmentModel(this.toDocument(treatment));
        const savedDoc = await treatmentDoc.save();
        return this.toEntity(savedDoc);
    }
    async update(treatment) {
        await TreatmentModel_1.TreatmentModel.findByIdAndUpdate(treatment.id, this.toDocument(treatment), { new: true, runValidators: true }).exec();
    }
    async updateById(id, updateData) {
        const updateQuery = {};
        if (updateData.name !== undefined)
            updateQuery.name = updateData.name;
        if (updateData.description !== undefined)
            updateQuery.description = updateData.description;
        if (updateData.cost !== undefined)
            updateQuery.cost = updateData.cost;
        if (updateData.date !== undefined)
            updateQuery.date = updateData.date;
        if (updateData.recordId !== undefined)
            updateQuery.recordId = updateData.recordId;
        await TreatmentModel_1.TreatmentModel.findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true }).exec();
    }
    async delete(id) {
        await TreatmentModel_1.TreatmentModel.findByIdAndDelete(id).exec();
    }
    async exists(id) {
        const count = await TreatmentModel_1.TreatmentModel.countDocuments({ _id: id }).exec();
        return count > 0;
    }
    async search(query) {
        const treatmentDocs = await TreatmentModel_1.TreatmentModel.find({
            $or: [
                { name: { $regex: new RegExp(query, 'i') } },
                { description: { $regex: new RegExp(query, 'i') } }
            ]
        }).exec();
        return treatmentDocs.map(doc => this.toEntity(doc));
    }
    toEntity(doc) {
        return Treatment_1.Treatment.create({
            id: doc._id.toString(),
            recordId: doc.recordId,
            name: doc.name,
            description: doc.description,
            date: doc.date,
            cost: doc.cost,
        });
    }
    toDocument(treatment) {
        return {
            recordId: treatment.recordId,
            name: treatment.name,
            description: treatment.description,
            date: treatment.date,
            cost: treatment.cost
        };
    }
}
exports.MongoTreatmentRepository = MongoTreatmentRepository;
//# sourceMappingURL=MongoTreatmentRepository.js.map