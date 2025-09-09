"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicalRecordRoutes = createMedicalRecordRoutes;
const express_1 = require("express");
function createMedicalRecordRoutes(medicalRecordController) {
    const router = (0, express_1.Router)();
    router.post("/", medicalRecordController.createMedicalRecord.bind(medicalRecordController));
    router.get("/", medicalRecordController.getAllRecords.bind(medicalRecordController));
    router.get("/:recordId", medicalRecordController.getById.bind(medicalRecordController));
    router.put("/:recordId", medicalRecordController.updateMedicalRecord.bind(medicalRecordController));
    router.delete("/:recordId", medicalRecordController.deleteMedicalRecord.bind(medicalRecordController));
    router.get("/patient/:patientId", medicalRecordController.getByPatientId.bind(medicalRecordController));
    router.get("/client/:clientId", medicalRecordController.getByClientId.bind(medicalRecordController));
    router.get("/veterinarian/:veterinarianId", medicalRecordController.getByVeterinarianId.bind(medicalRecordController));
    return router;
}
//# sourceMappingURL=medicalRecordRoutes.js.map