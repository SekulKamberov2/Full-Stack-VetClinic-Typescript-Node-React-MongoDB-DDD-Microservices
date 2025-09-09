import { Router } from "express";
import { MedicalRecordController } from "../controllers/MedicalRecordController";

export function createMedicalRecordRoutes(medicalRecordController: MedicalRecordController) {
  const router = Router();

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
