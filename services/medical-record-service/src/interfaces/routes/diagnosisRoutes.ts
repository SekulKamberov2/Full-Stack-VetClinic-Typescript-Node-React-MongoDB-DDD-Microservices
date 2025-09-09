import { Router } from "express";
import { DiagnosisController } from "../controllers/DiagnosisController";

export function createDiagnosisRoutes(diagnosisController: DiagnosisController) {
  const router = Router();
 
  router.get("/:recordId/diagnoses", diagnosisController.getByRecordId.bind(diagnosisController));
  router.get("/diagnoses/:diagnosisId", diagnosisController.getById.bind(diagnosisController));
  
  return router;
}
