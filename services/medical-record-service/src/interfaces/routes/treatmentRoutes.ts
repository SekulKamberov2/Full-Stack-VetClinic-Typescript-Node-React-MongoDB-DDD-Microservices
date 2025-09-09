import { Router } from "express";
import { TreatmentController } from "../controllers/TreatmentController";

export function createTreatmentRoutes(treatmentController: TreatmentController) {
  const router = Router();
 
  router.get("/:recordId/treatments", treatmentController.getByRecordId.bind(treatmentController));
  router.get("/treatments/:treatmentId", treatmentController.getById.bind(treatmentController));
 
  return router;
}
