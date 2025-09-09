"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentController = void 0;
class TreatmentController {
    constructor(getTreatmentsByRecordUseCase, getTreatmentByIdUseCase) {
        this.getTreatmentsByRecordUseCase = getTreatmentsByRecordUseCase;
        this.getTreatmentByIdUseCase = getTreatmentByIdUseCase;
    }
    async getByRecordId(req, res) {
        try {
            const { recordId } = req.params;
            if (!recordId || recordId.trim() === '') {
                res.status(400).json({
                    error: "Record ID is required"
                });
                return;
            }
            const treatments = await this.getTreatmentsByRecordUseCase.execute(recordId);
            res.status(200).json({
                treatments: treatments,
                count: treatments.length,
                recordId: recordId
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getById(req, res) {
        try {
            const { treatmentId } = req.params;
            if (!treatmentId || treatmentId.trim() === '') {
                res.status(400).json({
                    error: "Treatment ID is required"
                });
                return;
            }
            const treatment = await this.getTreatmentByIdUseCase.execute(treatmentId);
            res.status(200).json(treatment);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    handleError(res, error) {
        console.error('TreatmentController error:', error);
        if (error.message.includes("not found")) {
            res.status(404).json({
                error: error.message,
                code: "TREATMENT_NOT_FOUND"
            });
        }
        else if (error.message.includes("Record ID") || error.message.includes("Treatment ID")) {
            res.status(400).json({
                error: error.message,
                code: "INVALID_ID"
            });
        }
        else if (error.message.includes("required") || error.message.includes("must be")) {
            res.status(400).json({
                error: error.message,
                code: "VALIDATION_ERROR"
            });
        }
        else if (error.message.includes("already exists")) {
            res.status(409).json({
                error: error.message,
                code: "CONFLICT"
            });
        }
        else {
            res.status(500).json({
                error: "Internal server error",
                code: "INTERNAL_ERROR",
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}
exports.TreatmentController = TreatmentController;
//# sourceMappingURL=TreatmentController.js.map