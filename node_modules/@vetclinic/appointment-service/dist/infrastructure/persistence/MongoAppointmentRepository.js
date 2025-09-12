"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAppointmentRepository = void 0;
const Appointment_1 = require("../../domain/entities/Appointment");
const AppointmentModel_1 = require("./models/AppointmentModel");
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class MongoAppointmentRepository {
    constructor() {
        this.model = AppointmentModel_1.AppointmentModel;
    }
    async findById(id) {
        try {
            const appointmentDoc = await this.model.findById(id).exec();
            return appointmentDoc ? this.toEntity(appointmentDoc) : null;
        }
        catch (error) {
            this.handleDatabaseError(error, 'findById');
        }
    }
    async findByClientId(clientId) {
        try {
            const appointmentDocs = await this.model.find({ clientId })
                .sort({ appointmentDate: -1 })
                .exec();
            return appointmentDocs.map(doc => this.toEntity(doc));
        }
        catch (error) {
            this.handleDatabaseError(error, 'findByClientId');
        }
    }
    async findByVeterinarianId(veterinarianId) {
        try {
            const appointmentDocs = await this.model.find({ veterinarianId })
                .sort({ appointmentDate: -1 })
                .exec();
            return appointmentDocs.map(doc => this.toEntity(doc));
        }
        catch (error) {
            this.handleDatabaseError(error, 'findByVeterinarianId');
        }
    }
    async findByDateRange(startDate, endDate) {
        try {
            const appointmentDocs = await this.model.findByDateRange(startDate, endDate);
            return appointmentDocs.map(doc => this.toEntity(doc));
        }
        catch (error) {
            this.handleDatabaseError(error, 'findByDateRange');
        }
    }
    async findByVeterinarianIdAndDateRange(veterinarianId, startDate, endDate) {
        try {
            const appointmentDocs = await this.model.findByVeterinarianAndDateRange(veterinarianId, startDate, endDate);
            return appointmentDocs.map(doc => this.toEntity(doc));
        }
        catch (error) {
            this.handleDatabaseError(error, 'findByVeterinarianIdAndDateRange');
        }
    }
    async findConflictingAppointments(veterinarianId, appointmentDate, duration) {
        try {
            const appointmentDocs = await this.model.findConflictingAppointments(veterinarianId, appointmentDate, duration);
            return appointmentDocs.map(doc => this.toEntity(doc));
        }
        catch (error) {
            this.handleDatabaseError(error, 'findConflictingAppointments');
        }
    }
    async save(appointment) {
        try {
            if (!appointment.id || appointment.id === '') {
                const appointmentDoc = new this.model(this.toDocument(appointment));
                const savedDoc = await appointmentDoc.save();
                return this.toEntity(savedDoc);
            }
            const updatedDoc = await this.model.findByIdAndUpdate(appointment.id, this.toDocument(appointment), { new: true, runValidators: true }).exec();
            if (!updatedDoc) {
                throw new shared_kernel_1.NotFoundError(`Appointment with ID ${appointment.id} not found`, undefined, 'AppointmentRepository');
            }
            return this.toEntity(updatedDoc);
        }
        catch (error) {
            this.handleDatabaseError(error, 'save');
        }
    }
    async update(appointment) {
        try {
            const result = await this.model.findByIdAndUpdate(appointment.id, this.toDocument(appointment), { new: true, runValidators: true }).exec();
            if (!result) {
                throw new shared_kernel_1.NotFoundError(`Appointment with ID ${appointment.id} not found`, undefined, 'AppointmentRepository');
            }
        }
        catch (error) {
            this.handleDatabaseError(error, 'update');
        }
    }
    async delete(id) {
        try {
            const result = await this.model.findByIdAndDelete(id).exec();
            if (!result) {
                throw new shared_kernel_1.NotFoundError(`Appointment with ID ${id} not found`, undefined, 'AppointmentRepository');
            }
        }
        catch (error) {
            this.handleDatabaseError(error, 'delete');
        }
    }
    async exists(id) {
        try {
            const count = await this.model.countDocuments({ _id: id }).exec();
            return count > 0;
        }
        catch (error) {
            this.handleDatabaseError(error, 'exists');
        }
    }
    toEntity(doc) {
        const props = {
            id: doc._id.toString(),
            clientId: doc.clientId,
            patientId: doc.patientId,
            veterinarianId: doc.veterinarianId,
            appointmentDate: doc.appointmentDate,
            duration: doc.duration,
            status: doc.status,
            reason: doc.reason,
            notes: doc.notes,
            cancelledBy: doc.cancelledBy,
            cancellationReason: doc.cancellationReason,
            confirmedBy: doc.confirmedBy,
            completedBy: doc.completedBy,
            completedNotes: doc.completedNotes,
            startedBy: doc.startedBy,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
        return Appointment_1.Appointment.create(props);
    }
    toDocument(appointment) {
        return {
            clientId: appointment.clientId,
            patientId: appointment.patientId,
            veterinarianId: appointment.veterinarianId,
            appointmentDate: appointment.appointmentDate,
            duration: appointment.duration,
            status: appointment.status,
            reason: appointment.reason,
            notes: appointment.notes,
            cancelledBy: appointment.cancelledBy,
            cancellationReason: appointment.cancellationReason,
            confirmedBy: appointment.confirmedBy,
            completedBy: appointment.completedBy,
            completedNotes: appointment.completedNotes,
            startedBy: appointment.startedBy,
            updatedAt: new Date()
        };
    }
    handleDatabaseError(error, operation) {
        const context = `MongoAppointmentRepository.${operation}`;
        if (shared_kernel_1.AppError.isAppError(error)) {
            throw error;
        }
        if (error instanceof Error && error.name === 'ValidationError') {
            throw new shared_kernel_1.ValidationError(`Database validation failed: ${error.message}`, error, context);
        }
        if (error instanceof Error && error.name === 'CastError') {
            throw new shared_kernel_1.ValidationError('Invalid ID format', error, context);
        }
        if (this.isDuplicateKeyError(error)) {
            throw new shared_kernel_1.AppError('Duplicate appointment detected', 'DUPLICATE_APPOINTMENT', error, context);
        }
        throw new shared_kernel_1.AppError(`Database operation failed: ${operation}`, 'DATABASE_OPERATION_FAILED', error, context);
    }
    isDuplicateKeyError(error) {
        return error instanceof Error &&
            'code' in error &&
            error.code === 11000;
    }
    async countByStatus(status) {
        try {
            return await this.model.countDocuments({ status }).exec();
        }
        catch (error) {
            this.handleDatabaseError(error, 'countByStatus');
        }
    }
    async findByStatus(status) {
        try {
            const appointmentDocs = await this.model.find({ status })
                .sort({ appointmentDate: 1 })
                .exec();
            return appointmentDocs.map(doc => this.toEntity(doc));
        }
        catch (error) {
            this.handleDatabaseError(error, 'findByStatus');
        }
    }
    async getUpcomingAppointments(days = 7) {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);
            const appointmentDocs = await this.model.find({
                appointmentDate: { $gte: startDate, $lte: endDate },
                status: { $in: [Appointment_1.AppointmentStatus.SCHEDULED, Appointment_1.AppointmentStatus.CONFIRMED] }
            }).sort({ appointmentDate: 1 }).exec();
            return appointmentDocs.map(doc => this.toEntity(doc));
        }
        catch (error) {
            this.handleDatabaseError(error, 'getUpcomingAppointments');
        }
    }
}
exports.MongoAppointmentRepository = MongoAppointmentRepository;
//# sourceMappingURL=MongoAppointmentRepository.js.map