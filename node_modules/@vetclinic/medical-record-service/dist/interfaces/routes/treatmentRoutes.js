"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTreatmentRoutes = createTreatmentRoutes;
const express_1 = require("express");
function createTreatmentRoutes(treatmentController) {
    const router = (0, express_1.Router)();
    router.get("/:recordId/treatments", treatmentController.getByRecordId.bind(treatmentController));
    router.get("/treatments/:treatmentId", treatmentController.getById.bind(treatmentController));
    return router;
}
//# sourceMappingURL=treatmentRoutes.js.map