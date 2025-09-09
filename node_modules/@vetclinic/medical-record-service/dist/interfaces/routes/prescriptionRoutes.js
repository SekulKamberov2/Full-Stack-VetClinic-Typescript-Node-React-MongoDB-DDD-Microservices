"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrescriptionRoutes = createPrescriptionRoutes;
const express_1 = require("express");
function createPrescriptionRoutes(prescriptionController) {
    const router = (0, express_1.Router)();
    router.post("/:recordId/prescriptions", prescriptionController.addPrescription.bind(prescriptionController));
    router.get("/:recordId/prescriptions", prescriptionController.getByRecordId.bind(prescriptionController));
    router.get("/prescriptions/:prescriptionId", prescriptionController.getById.bind(prescriptionController));
    router.put("/prescriptions/:prescriptionId", prescriptionController.updatePrescription.bind(prescriptionController));
    router.delete("/prescriptions/:prescriptionId", prescriptionController.deletePrescription.bind(prescriptionController));
    router.patch("/prescriptions/:prescriptionId/fill", prescriptionController.markAsFilled.bind(prescriptionController));
    return router;
}
//# sourceMappingURL=prescriptionRoutes.js.map