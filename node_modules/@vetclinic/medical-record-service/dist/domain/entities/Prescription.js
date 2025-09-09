"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prescription = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class Prescription {
    constructor(props) {
        this.id = props.id || "";
        this.recordId = props.recordId || "";
        this.medicationName = props.medicationName;
        this.dosage = props.dosage;
        this.instructions = props.instructions;
        this.datePrescribed = props.datePrescribed || new Date();
        this.refills = props.refills;
        this.filledDate = props.filledDate;
        this.filledBy = props.filledBy;
        this.status = props.status || 'pending';
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    static create(props) {
        if (!props.medicationName || props.medicationName.trim() === '') {
            throw new shared_kernel_1.ValidationError("Medication name is required", undefined, 'Prescription validation');
        }
        if (props.medicationName.length > 100) {
            throw new shared_kernel_1.ValidationError("Medication name cannot exceed 100 characters", undefined, 'Prescription validation');
        }
        if (!props.dosage || props.dosage.trim() === '') {
            throw new shared_kernel_1.ValidationError("Dosage is required", undefined, 'Prescription validation');
        }
        if (props.dosage.length > 50) {
            throw new shared_kernel_1.ValidationError("Dosage cannot exceed 50 characters", undefined, 'Prescription validation');
        }
        if (!props.instructions || props.instructions.trim() === '') {
            throw new shared_kernel_1.ValidationError("Instructions are required", undefined, 'Prescription validation');
        }
        if (props.instructions.length > 500) {
            throw new shared_kernel_1.ValidationError("Instructions cannot exceed 500 characters", undefined, 'Prescription validation');
        }
        if (props.refills < 0) {
            throw new shared_kernel_1.ValidationError("Refills cannot be negative", undefined, 'Prescription validation');
        }
        if (props.refills > 10) {
            throw new shared_kernel_1.ValidationError("Refills cannot exceed 10", undefined, 'Prescription validation');
        }
        return new Prescription(props);
    }
    update(updateData) {
        if (updateData.medicationName !== undefined) {
            if (!updateData.medicationName || updateData.medicationName.trim() === '') {
                throw new shared_kernel_1.ValidationError("Medication name is required", undefined, 'Prescription validation');
            }
            if (updateData.medicationName.length > 100) {
                throw new shared_kernel_1.ValidationError("Medication name cannot exceed 100 characters", undefined, 'Prescription validation');
            }
        }
        if (updateData.dosage !== undefined) {
            if (!updateData.dosage || updateData.dosage.trim() === '') {
                throw new shared_kernel_1.ValidationError("Dosage is required", undefined, 'Prescription validation');
            }
            if (updateData.dosage.length > 50) {
                throw new shared_kernel_1.ValidationError("Dosage cannot exceed 50 characters", undefined, 'Prescription validation');
            }
        }
        if (updateData.instructions !== undefined) {
            if (!updateData.instructions || updateData.instructions.trim() === '') {
                throw new shared_kernel_1.ValidationError("Instructions are required", undefined, 'Prescription validation');
            }
            if (updateData.instructions.length > 500) {
                throw new shared_kernel_1.ValidationError("Instructions cannot exceed 500 characters", undefined, 'Prescription validation');
            }
        }
        if (updateData.refills !== undefined) {
            if (updateData.refills < 0) {
                throw new shared_kernel_1.ValidationError("Refills cannot be negative", undefined, 'Prescription validation');
            }
            if (updateData.refills > 10) {
                throw new shared_kernel_1.ValidationError("Refills cannot exceed 10", undefined, 'Prescription validation');
            }
        }
        return new Prescription({
            ...this.toProps(),
            ...updateData,
            updatedAt: new Date(),
        });
    }
    setRecordId(recordId) {
        if (!recordId || recordId.trim() === '') {
            throw new shared_kernel_1.ValidationError("Record ID cannot be empty", undefined, 'Prescription validation');
        }
        if (recordId.length < 3) {
            throw new shared_kernel_1.ValidationError("Record ID appears to be invalid", undefined, 'Prescription validation');
        }
        return new Prescription({
            ...this.toProps(),
            recordId,
        });
    }
    setId(id) {
        if (!id || id.trim() === '') {
            throw new shared_kernel_1.ValidationError("ID cannot be empty", undefined, 'Prescription validation');
        }
        if (id.length < 3) {
            throw new shared_kernel_1.ValidationError("ID appears to be invalid", undefined, 'Prescription validation');
        }
        return new Prescription({
            ...this.toProps(),
            id,
        });
    }
    toProps() {
        return {
            id: this.id,
            recordId: this.recordId,
            medicationName: this.medicationName,
            dosage: this.dosage,
            instructions: this.instructions,
            datePrescribed: this.datePrescribed,
            refills: this.refills,
            filledDate: this.filledDate,
            filledBy: this.filledBy,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    isNew() {
        return !this.id || this.id.trim() === '';
    }
    markAsFilled(filledBy, filledDate = new Date()) {
        if (!filledBy || filledBy.trim() === '') {
            throw new shared_kernel_1.ValidationError("Filled by cannot be empty", undefined, 'Prescription validation');
        }
        if (filledBy.length < 2) {
            throw new shared_kernel_1.ValidationError("Filled by appears to be invalid", undefined, 'Prescription validation');
        }
        return this.update({
            status: 'filled',
            filledBy,
            filledDate,
        });
    }
    markAsPending() {
        return this.update({
            status: 'pending',
            filledBy: undefined,
            filledDate: undefined,
        });
    }
    cancel() {
        return this.update({
            status: 'cancelled',
        });
    }
    complete() {
        return this.update({
            status: 'completed',
        });
    }
    hasRefillsAvailable() {
        return this.refills > 0;
    }
    isFilled() {
        return this.status === 'filled' || this.status === 'completed';
    }
    isPending() {
        return this.status === 'pending';
    }
    isExpired() {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return this.datePrescribed < oneYearAgo;
    }
    isValid() {
        return this.medicationName.trim() !== '' &&
            this.medicationName.length <= 100 &&
            this.dosage.trim() !== '' &&
            this.dosage.length <= 50 &&
            this.instructions.trim() !== '' &&
            this.instructions.length <= 500 &&
            this.refills >= 0 &&
            this.refills <= 10 &&
            this.recordId.trim() !== '' &&
            this.datePrescribed <= new Date() &&
            (!this.filledBy || this.filledBy.trim() !== '') &&
            (!this.filledDate || this.filledDate <= new Date());
    }
    getSummary() {
        return `${this.medicationName} - ${this.dosage} (${this.status})`;
    }
    canBeFilled() {
        return this.isPending() && !this.isExpired();
    }
    requiresRefill() {
        return this.isFilled() && this.hasRefillsAvailable();
    }
}
exports.Prescription = Prescription;
//# sourceMappingURL=Prescription.js.map