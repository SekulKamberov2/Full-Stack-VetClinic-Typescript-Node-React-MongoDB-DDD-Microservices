"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosisController = void 0;
class DiagnosisController {
    constructor(getDiagnosesByRecordUseCase, getDiagnosisByIdUseCase) {
        this.getDiagnosesByRecordUseCase = getDiagnosesByRecordUseCase;
        this.getDiagnosisByIdUseCase = getDiagnosisByIdUseCase;
    }
    async getByRecordId(req, res) {
        try {
            const { recordId } = req.params;
            const diagnoses = await this.getDiagnosesByRecordUseCase.execute(recordId);
            res.status(200).json(diagnoses);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getById(req, res) {
        try {
            const { diagnosisId } = req.params;
            const diagnosis = await this.getDiagnosisByIdUseCase.execute(diagnosisId);
            res.status(200).json(diagnosis);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    handleError(res, error) {
        console.error('DiagnosisController error:', error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
        }
        else if (error.message.includes("already") || error.message.includes("invalid")) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.DiagnosisController = DiagnosisController;
//# sourceMappingURL=DiagnosisController.js.map