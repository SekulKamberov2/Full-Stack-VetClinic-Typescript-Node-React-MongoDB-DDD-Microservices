"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const AddPrescriptionToRecordUseCase_1 = require("../../application/use-cases/AddPrescriptionToRecordUseCase");
class PrescriptionController {
    constructor(medicalRecordRepository, prescriptionRepository, getPrescriptionsByRecordUseCase, getPrescriptionByIdUseCase, updatePrescriptionUseCase, deletePrescriptionUseCase, markPrescriptionFilledUseCase) {
        this.getPrescriptionsByRecordUseCase = getPrescriptionsByRecordUseCase;
        this.getPrescriptionByIdUseCase = getPrescriptionByIdUseCase;
        this.updatePrescriptionUseCase = updatePrescriptionUseCase;
        this.deletePrescriptionUseCase = deletePrescriptionUseCase;
        this.markPrescriptionFilledUseCase = markPrescriptionFilledUseCase;
        this.addPrescriptionUseCase = new AddPrescriptionToRecordUseCase_1.AddPrescriptionToRecordUseCase(medicalRecordRepository, prescriptionRepository);
    }
    async addPrescription(req, res) {
        try {
            const { recordId } = req.params;
            const { medicationName, dosage, instructions, refills, datePrescribed, status } = req.body;
            if (!medicationName || !dosage || refills === undefined) {
                res.status(400).json({ error: "medicationName, dosage, and refills are required" });
                return;
            }
            const prescription = await this.addPrescriptionUseCase.execute(recordId, medicationName, dosage, instructions || "", refills, datePrescribed ? new Date(datePrescribed) : undefined, status || 'pending');
            res.status(201).json({
                message: "Prescription added successfully",
                prescriptionId: prescription.id,
                recordId: recordId,
                prescription: prescription
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getByRecordId(req, res) {
        try {
            const { recordId } = req.params;
            const prescriptions = await this.getPrescriptionsByRecordUseCase.execute(recordId);
            res.status(200).json(prescriptions);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getById(req, res) {
        try {
            const { prescriptionId } = req.params;
            const prescription = await this.getPrescriptionByIdUseCase.execute(prescriptionId);
            res.status(200).json(prescription);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async updatePrescription(req, res) {
        try {
            const { prescriptionId } = req.params;
            const updateData = req.body;
            if (updateData.datePrescribed) {
                updateData.datePrescribed = new Date(updateData.datePrescribed);
            }
            if (updateData.filledDate) {
                updateData.filledDate = new Date(updateData.filledDate);
            }
            await this.updatePrescriptionUseCase.execute(prescriptionId, updateData);
            res.status(200).json({
                message: "Prescription updated successfully",
                prescriptionId: prescriptionId
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async deletePrescription(req, res) {
        try {
            const { prescriptionId } = req.params;
            await this.deletePrescriptionUseCase.execute(prescriptionId);
            res.status(200).json({
                message: "Prescription deleted successfully",
                prescriptionId: prescriptionId
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async markAsFilled(req, res) {
        try {
            const { prescriptionId } = req.params;
            const { filledDate, filledBy } = req.body;
            await this.markPrescriptionFilledUseCase.execute(prescriptionId, filledDate ? new Date(filledDate) : new Date(), filledBy);
            res.status(200).json({
                message: "Prescription marked as filled",
                prescriptionId: prescriptionId
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    handleError(res, error) {
        console.error('PrescriptionController error:', error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
        }
        else if (error.message.includes("already") || error.message.includes("invalid") || error.message.includes("required")) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.PrescriptionController = PrescriptionController;
//# sourceMappingURL=PrescriptionController.js.map