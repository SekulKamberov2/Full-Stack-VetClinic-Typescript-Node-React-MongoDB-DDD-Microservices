"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = exports.AppointmentStatus = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["SCHEDULED"] = "SCHEDULED";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
class Appointment {
    constructor(props) {
        this.id = props.id || '';
        this.clientId = props.clientId;
        this.patientId = props.patientId;
        this.veterinarianId = props.veterinarianId;
        this.appointmentDate = props.appointmentDate;
        this.duration = props.duration;
        this.status = props.status;
        this.reason = props.reason;
        this.notes = props.notes;
        this.cancelledBy = props.cancelledBy;
        this.cancellationReason = props.cancellationReason;
        this.confirmedBy = props.confirmedBy;
        this.completedBy = props.completedBy;
        this.completedNotes = props.completedNotes;
        this.startedBy = props.startedBy;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    static create(props) {
        return new Appointment({
            id: '',
            ...props
        });
    }
    static validate(props) {
        if (props.reason && (!props.reason || props.reason.trim() === '')) {
            throw new shared_kernel_1.ValidationError("Reason is required", undefined, 'Appointment validation');
        }
        if (props.reason && props.reason.length > 500) {
            throw new shared_kernel_1.ValidationError("Reason cannot exceed 500 characters", undefined, 'Appointment validation');
        }
        if (props.notes && props.notes.length > 1000) {
            throw new shared_kernel_1.ValidationError("Notes cannot exceed 1000 characters", undefined, 'Appointment validation');
        }
        if (props.cancellationReason && props.cancellationReason.length > 500) {
            throw new shared_kernel_1.ValidationError("Cancellation reason cannot exceed 500 characters", undefined, 'Appointment validation');
        }
        if (props.completedNotes && props.completedNotes.length > 1000) {
            throw new shared_kernel_1.ValidationError("Completed notes cannot exceed 1000 characters", undefined, 'Appointment validation');
        }
        if (props.duration && (props.duration < 5 || props.duration > 480)) {
            throw new shared_kernel_1.ValidationError("Duration must be between 5 and 480 minutes", undefined, 'Appointment validation');
        }
    }
    confirm(confirmedBy) {
        if (this.status !== AppointmentStatus.SCHEDULED) {
            throw new shared_kernel_1.ValidationError('Only scheduled appointments can be confirmed', undefined, 'Appointment validation');
        }
        return new Appointment({
            ...this.toProps(),
            status: AppointmentStatus.CONFIRMED,
            confirmedBy,
            updatedAt: new Date(),
        });
    }
    cancel(cancelledBy, reason) {
        if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(this.status)) {
            throw new shared_kernel_1.ValidationError('Cannot cancel completed or already cancelled appointment', undefined, 'Appointment validation');
        }
        return new Appointment({
            ...this.toProps(),
            status: AppointmentStatus.CANCELLED,
            cancelledBy,
            cancellationReason: reason,
            updatedAt: new Date(),
        });
    }
    complete(completedBy, notes) {
        if (this.status !== AppointmentStatus.IN_PROGRESS) {
            throw new shared_kernel_1.ValidationError('Only appointments in progress can be completed', undefined, 'Appointment validation');
        }
        return new Appointment({
            ...this.toProps(),
            status: AppointmentStatus.COMPLETED,
            completedBy,
            completedNotes: notes,
            updatedAt: new Date(),
        });
    }
    markAsNoShow() {
        if (this.status !== AppointmentStatus.SCHEDULED && this.status !== AppointmentStatus.CONFIRMED) {
            throw new shared_kernel_1.ValidationError('Only scheduled or confirmed appointments can be marked as no-show', undefined, 'Appointment validation');
        }
        return new Appointment({
            ...this.toProps(),
            status: AppointmentStatus.NO_SHOW,
            updatedAt: new Date(),
        });
    }
    updateNotes(notes) {
        if (notes.length > 1000) {
            throw new shared_kernel_1.ValidationError("Notes cannot exceed 1000 characters", undefined, 'Appointment validation');
        }
        return new Appointment({
            ...this.toProps(),
            notes,
            updatedAt: new Date(),
        });
    }
    start(startedBy) {
        if (this.status !== AppointmentStatus.CONFIRMED) {
            throw new shared_kernel_1.ValidationError('Only confirmed appointments can be started', undefined, 'Appointment validation');
        }
        return new Appointment({
            ...this.toProps(),
            status: AppointmentStatus.IN_PROGRESS,
            startedBy,
            updatedAt: new Date(),
        });
    }
    toProps() {
        return {
            id: this.id,
            clientId: this.clientId,
            patientId: this.patientId,
            veterinarianId: this.veterinarianId,
            appointmentDate: this.appointmentDate,
            duration: this.duration,
            status: this.status,
            reason: this.reason,
            notes: this.notes,
            cancelledBy: this.cancelledBy,
            cancellationReason: this.cancellationReason,
            confirmedBy: this.confirmedBy,
            completedBy: this.completedBy,
            completedNotes: this.completedNotes,
            startedBy: this.startedBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    isValid() {
        return this.reason.trim() !== '' &&
            this.reason.length <= 500 &&
            (!this.notes || this.notes.length <= 1000) &&
            (!this.cancellationReason || this.cancellationReason.length <= 500) &&
            (!this.completedNotes || this.completedNotes.length <= 1000) &&
            this.duration >= 5 &&
            this.duration <= 480 &&
            this.appointmentDate > new Date();
    }
    isUpcoming() {
        const now = new Date();
        return this.appointmentDate > now &&
            [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(this.status);
    }
    isPast() {
        const now = new Date();
        return this.appointmentDate <= now;
    }
    canBeModified() {
        return [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(this.status);
    }
}
exports.Appointment = Appointment;
//# sourceMappingURL=Appointment.js.map