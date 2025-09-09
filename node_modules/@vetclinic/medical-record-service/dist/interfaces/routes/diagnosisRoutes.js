"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiagnosisRoutes = createDiagnosisRoutes;
const express_1 = require("express");
function createDiagnosisRoutes(diagnosisController) {
    const router = (0, express_1.Router)();
    router.get("/:recordId/diagnoses", diagnosisController.getByRecordId.bind(diagnosisController));
    router.get("/diagnoses/:diagnosisId", diagnosisController.getById.bind(diagnosisController));
    return router;
}
//# sourceMappingURL=diagnosisRoutes.js.map