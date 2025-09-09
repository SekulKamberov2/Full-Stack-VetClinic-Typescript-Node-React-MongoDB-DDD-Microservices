"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagnosis = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class Diagnosis {
    constructor(props) {
        this.id = props.id || "";
        this.recordId = props.recordId || "";
        this.description = props.description;
        this.date = props.date || new Date();
        this.notes = props.notes;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    static create(props) {
        if (!props.description || props.description.trim() === '') {
            throw new shared_kernel_1.ValidationError("Description is required", undefined, 'Diagnosis validation');
        }
        if (props.description.length > 500) {
            throw new shared_kernel_1.ValidationError("Description cannot exceed 500 characters", undefined, 'Diagnosis validation');
        }
        if (props.notes && props.notes.length > 1000) {
            throw new shared_kernel_1.ValidationError("Notes cannot exceed 1000 characters", undefined, 'Diagnosis validation');
        }
        return new Diagnosis(props);
    }
    updateDetails(updateData) {
        if (updateData.description && (!updateData.description || updateData.description.trim() === '')) {
            throw new shared_kernel_1.ValidationError("Description is required", undefined, 'Diagnosis validation');
        }
        if (updateData.description && updateData.description.length > 500) {
            throw new shared_kernel_1.ValidationError("Description cannot exceed 500 characters", undefined, 'Diagnosis validation');
        }
        if (updateData.notes && updateData.notes.length > 1000) {
            throw new shared_kernel_1.ValidationError("Notes cannot exceed 1000 characters", undefined, 'Diagnosis validation');
        }
        return new Diagnosis({
            ...this.toProps(),
            ...updateData,
            updatedAt: new Date(),
        });
    }
    setRecordId(recordId) {
        if (!recordId || recordId.trim() === '') {
            throw new shared_kernel_1.ValidationError("Record ID cannot be empty", undefined, 'Diagnosis validation');
        }
        if (recordId.length < 3) {
            throw new shared_kernel_1.ValidationError("Record ID appears to be invalid", undefined, 'Diagnosis validation');
        }
        return new Diagnosis({
            ...this.toProps(),
            recordId,
        });
    }
    setId(id) {
        if (!id || id.trim() === '') {
            throw new shared_kernel_1.ValidationError("ID cannot be empty", undefined, 'Diagnosis validation');
        }
        if (id.length < 3) {
            throw new shared_kernel_1.ValidationError("ID appears to be invalid", undefined, 'Diagnosis validation');
        }
        return new Diagnosis({
            ...this.toProps(),
            id,
        });
    }
    toProps() {
        return {
            id: this.id,
            recordId: this.recordId,
            description: this.description,
            date: this.date,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    isValid() {
        return this.description.trim() !== '' &&
            this.description.length <= 500 &&
            (!this.notes || this.notes.length <= 1000) &&
            this.recordId.trim() !== '' &&
            this.date <= new Date();
    }
    getSummary() {
        return `${this.description} (${this.date.toLocaleDateString()})`;
    }
    hasNotes() {
        return !!this.notes && this.notes.trim() !== '';
    }
    isRecent(maxDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxDays);
        return this.date >= cutoffDate;
    }
}
exports.Diagnosis = Diagnosis;
//# sourceMappingURL=Diagnosis.js.map