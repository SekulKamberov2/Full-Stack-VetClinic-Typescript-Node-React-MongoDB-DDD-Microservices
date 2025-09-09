"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Treatment = void 0;
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class Treatment {
    constructor(props) {
        this.id = props.id || "";
        this.recordId = props.recordId || "";
        this.name = props.name;
        this.description = props.description;
        this.date = props.date || new Date();
        this.cost = props.cost;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    static create(props) {
        if (!props.name || props.name.trim() === '') {
            throw new shared_kernel_1.ValidationError("Name is required", undefined, 'Treatment validation');
        }
        if (props.name.length > 100) {
            throw new shared_kernel_1.ValidationError("Name cannot exceed 100 characters", undefined, 'Treatment validation');
        }
        if (!props.description || props.description.trim() === '') {
            throw new shared_kernel_1.ValidationError("Description is required", undefined, 'Treatment validation');
        }
        if (props.description.length > 500) {
            throw new shared_kernel_1.ValidationError("Description cannot exceed 500 characters", undefined, 'Treatment validation');
        }
        if (props.cost < 0) {
            throw new shared_kernel_1.ValidationError("Cost cannot be negative", undefined, 'Treatment validation');
        }
        if (props.cost > 10000) {
            throw new shared_kernel_1.ValidationError("Cost cannot exceed $10,000", undefined, 'Treatment validation');
        }
        return new Treatment(props);
    }
    update(updateData) {
        if (updateData.name !== undefined) {
            if (!updateData.name || updateData.name.trim() === '') {
                throw new shared_kernel_1.ValidationError("Name is required", undefined, 'Treatment validation');
            }
            if (updateData.name.length > 100) {
                throw new shared_kernel_1.ValidationError("Name cannot exceed 100 characters", undefined, 'Treatment validation');
            }
        }
        if (updateData.description !== undefined) {
            if (!updateData.description || updateData.description.trim() === '') {
                throw new shared_kernel_1.ValidationError("Description is required", undefined, 'Treatment validation');
            }
            if (updateData.description.length > 500) {
                throw new shared_kernel_1.ValidationError("Description cannot exceed 500 characters", undefined, 'Treatment validation');
            }
        }
        if (updateData.cost !== undefined) {
            if (updateData.cost < 0) {
                throw new shared_kernel_1.ValidationError("Cost cannot be negative", undefined, 'Treatment validation');
            }
            if (updateData.cost > 10000) {
                throw new shared_kernel_1.ValidationError("Cost cannot exceed $10,000", undefined, 'Treatment validation');
            }
        }
        return new Treatment({
            ...this.toProps(),
            ...updateData,
            updatedAt: new Date(),
        });
    }
    setRecordId(recordId) {
        if (!recordId || recordId.trim() === '') {
            throw new shared_kernel_1.ValidationError("Record ID cannot be empty", undefined, 'Treatment validation');
        }
        if (recordId.length < 3) {
            throw new shared_kernel_1.ValidationError("Record ID appears to be invalid", undefined, 'Treatment validation');
        }
        return new Treatment({
            ...this.toProps(),
            recordId,
        });
    }
    setId(id) {
        if (!id || id.trim() === '') {
            throw new shared_kernel_1.ValidationError("ID cannot be empty", undefined, 'Treatment validation');
        }
        if (id.length < 3) {
            throw new shared_kernel_1.ValidationError("ID appears to be invalid", undefined, 'Treatment validation');
        }
        return new Treatment({
            ...this.toProps(),
            id,
        });
    }
    toProps() {
        return {
            id: this.id,
            recordId: this.recordId,
            name: this.name,
            description: this.description,
            date: this.date,
            cost: this.cost,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    isNew() {
        return !this.id || this.id.trim() === '';
    }
    getFormattedCost() {
        return `$${this.cost.toFixed(2)}`;
    }
    isRecent() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return this.date >= thirtyDaysAgo;
    }
    isValid() {
        return this.name.trim() !== '' &&
            this.name.length <= 100 &&
            this.description.trim() !== '' &&
            this.description.length <= 500 &&
            this.cost >= 0 &&
            this.cost <= 10000 &&
            this.recordId.trim() !== '' &&
            this.date <= new Date();
    }
    getSummary() {
        return `${this.name} - ${this.getFormattedCost()}`;
    }
    isExpensive() {
        return this.cost > 500;
    }
    isStandardCost() {
        return this.cost >= 50 && this.cost <= 500;
    }
    isLowCost() {
        return this.cost < 50;
    }
    updateCost(newCost) {
        if (newCost < 0) {
            throw new shared_kernel_1.ValidationError("Cost cannot be negative", undefined, 'Treatment validation');
        }
        if (newCost > 10000) {
            throw new shared_kernel_1.ValidationError("Cost cannot exceed $10,000", undefined, 'Treatment validation');
        }
        return this.update({ cost: newCost });
    }
    updateDescription(newDescription) {
        if (!newDescription || newDescription.trim() === '') {
            throw new shared_kernel_1.ValidationError("Description is required", undefined, 'Treatment validation');
        }
        if (newDescription.length > 500) {
            throw new shared_kernel_1.ValidationError("Description cannot exceed 500 characters", undefined, 'Treatment validation');
        }
        return this.update({ description: newDescription });
    }
    updateName(newName) {
        if (!newName || newName.trim() === '') {
            throw new shared_kernel_1.ValidationError("Name is required", undefined, 'Treatment validation');
        }
        if (newName.length > 100) {
            throw new shared_kernel_1.ValidationError("Name cannot exceed 100 characters", undefined, 'Treatment validation');
        }
        return this.update({ name: newName });
    }
    isFutureDated() {
        return this.date > new Date();
    }
    isPastDated() {
        return this.date < new Date();
    }
    isToday() {
        const today = new Date();
        return this.date.toDateString() === today.toDateString();
    }
}
exports.Treatment = Treatment;
//# sourceMappingURL=Treatment.js.map