"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDiagnosisRepository = void 0;
const Diagnosis_1 = require("../../domain/entities/Diagnosis");
const DiagnosisModel_1 = require("./models/DiagnosisModel");
class MongoDiagnosisRepository {
    async findById(id) {
        const diagnosisDoc = await DiagnosisModel_1.DiagnosisModel.findById(id).exec();
        return diagnosisDoc ? this.toEntity(diagnosisDoc) : null;
    }
    async findByRecordId(recordId) {
        const diagnosisDocs = await DiagnosisModel_1.DiagnosisModel.find({ recordId })
            .sort({ date: -1 })
            .exec();
        return diagnosisDocs.map(doc => this.toEntity(doc));
    }
    async findByDescription(description) {
        const diagnosisDocs = await DiagnosisModel_1.DiagnosisModel.find({
            description: { $regex: new RegExp(description, 'i') }
        }).exec();
        return diagnosisDocs.map(doc => this.toEntity(doc));
    }
    async findByDateRange(startDate, endDate) {
        const diagnosisDocs = await DiagnosisModel_1.DiagnosisModel.find({
            date: { $gte: startDate, $lte: endDate }
        }).exec();
        return diagnosisDocs.map(doc => this.toEntity(doc));
    }
    async findRecent(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const diagnosisDocs = await DiagnosisModel_1.DiagnosisModel.find({
            date: { $gte: cutoffDate }
        }).exec();
        return diagnosisDocs.map(doc => this.toEntity(doc));
    }
    async findWithNotes() {
        const diagnosisDocs = await DiagnosisModel_1.DiagnosisModel.find({
            notes: { $exists: true, $ne: '' }
        }).exec();
        return diagnosisDocs.map(doc => this.toEntity(doc));
    }
    async findAll() {
        const diagnosisDocs = await DiagnosisModel_1.DiagnosisModel.find().exec();
        return diagnosisDocs.map(doc => this.toEntity(doc));
    }
    async getStats() {
        const totalDiagnoses = await DiagnosisModel_1.DiagnosisModel.countDocuments();
        const diagnosesWithNotes = await DiagnosisModel_1.DiagnosisModel.countDocuments({
            notes: { $exists: true, $ne: '' }
        });
        const diagnosesByRecordAgg = await DiagnosisModel_1.DiagnosisModel.aggregate([
            {
                $group: {
                    _id: '$recordId',
                    count: { $sum: 1 }
                }
            }
        ]);
        const mostCommonDiagnosesAgg = await DiagnosisModel_1.DiagnosisModel.aggregate([
            {
                $group: {
                    _id: '$description',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        const diagnosesByRecord = {};
        diagnosesByRecordAgg.forEach(item => {
            diagnosesByRecord[item._id] = item.count;
        });
        const mostCommonDiagnoses = mostCommonDiagnosesAgg.map(item => ({
            diagnosis: item._id,
            count: item.count
        }));
        return {
            totalDiagnoses,
            diagnosesWithNotes,
            diagnosesByRecord,
            mostCommonDiagnoses
        };
    }
    async save(diagnosis) {
        const diagnosisDoc = new DiagnosisModel_1.DiagnosisModel(this.toDocument(diagnosis));
        const savedDoc = await diagnosisDoc.save();
        return this.toEntity(savedDoc);
    }
    async update(diagnosis) {
        await DiagnosisModel_1.DiagnosisModel.findByIdAndUpdate(diagnosis.id, this.toDocument(diagnosis), { new: true, runValidators: true }).exec();
    }
    async updateById(id, updateData) {
        const updateQuery = {};
        if (updateData.description !== undefined)
            updateQuery.description = updateData.description;
        if (updateData.notes !== undefined)
            updateQuery.notes = updateData.notes;
        if (updateData.date !== undefined)
            updateQuery.date = updateData.date;
        if (updateData.recordId !== undefined)
            updateQuery.recordId = updateData.recordId;
        await DiagnosisModel_1.DiagnosisModel.findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true }).exec();
    }
    async delete(id) {
        await DiagnosisModel_1.DiagnosisModel.findByIdAndDelete(id).exec();
    }
    async exists(id) {
        const count = await DiagnosisModel_1.DiagnosisModel.countDocuments({ _id: id }).exec();
        return count > 0;
    }
    async search(query) {
        const diagnosisDocs = await DiagnosisModel_1.DiagnosisModel.find({
            $or: [
                { description: { $regex: new RegExp(query, 'i') } },
                { notes: { $regex: new RegExp(query, 'i') } }
            ]
        }).exec();
        return diagnosisDocs.map(doc => this.toEntity(doc));
    }
    async getDiagnosisStats() {
        const total = await DiagnosisModel_1.DiagnosisModel.countDocuments();
        const withNotes = await DiagnosisModel_1.DiagnosisModel.countDocuments({
            notes: { $exists: true, $ne: '' }
        });
        const byRecordAgg = await DiagnosisModel_1.DiagnosisModel.aggregate([
            {
                $group: {
                    _id: '$recordId',
                    count: { $sum: 1 }
                }
            }
        ]);
        const topDiagnosesAgg = await DiagnosisModel_1.DiagnosisModel.aggregate([
            {
                $group: {
                    _id: '$description',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        const monthlyTrendAgg = await DiagnosisModel_1.DiagnosisModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);
        const byRecord = {};
        byRecordAgg.forEach(item => {
            byRecord[item._id] = item.count;
        });
        const topDiagnoses = topDiagnosesAgg.map(item => ({
            diagnosis: item._id,
            count: item.count
        }));
        const monthlyTrend = monthlyTrendAgg.map(item => ({
            month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
            count: item.count
        }));
        return {
            total,
            withNotes,
            byRecord,
            topDiagnoses,
            monthlyTrend
        };
    }
    async bulkUpdateNotes(ids, notes) {
        await DiagnosisModel_1.DiagnosisModel.updateMany({ _id: { $in: ids } }, { notes }, { runValidators: true }).exec();
    }
    async getDiagnosisTrend(startDate, endDate) {
        const trendAgg = await DiagnosisModel_1.DiagnosisModel.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        day: { $dayOfMonth: '$date' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        return trendAgg.map(item => ({
            date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
            count: item.count
        }));
    }
    toEntity(doc) {
        const props = {
            id: doc._id.toString(),
            recordId: doc.recordId,
            description: doc.description,
            date: doc.date,
            notes: doc.notes,
        };
        return Diagnosis_1.Diagnosis.create(props);
    }
    toDocument(diagnosis) {
        return {
            recordId: diagnosis.recordId,
            description: diagnosis.description,
            date: diagnosis.date,
            notes: diagnosis.notes
        };
    }
}
exports.MongoDiagnosisRepository = MongoDiagnosisRepository;
//# sourceMappingURL=MongoDiagnosisRepository.js.map