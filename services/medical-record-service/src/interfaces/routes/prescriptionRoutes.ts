import { Router } from "express";
import { PrescriptionController } from "../controllers/PrescriptionController"; 

export function createPrescriptionRoutes(prescriptionController: PrescriptionController) {
  const router = Router();
 
  router.post("/:recordId/prescriptions", prescriptionController.addPrescription.bind(prescriptionController));
  router.get("/:recordId/prescriptions", prescriptionController.getByRecordId.bind(prescriptionController));
 
  router.get("/prescriptions/:prescriptionId", prescriptionController.getById.bind(prescriptionController));
  router.put("/prescriptions/:prescriptionId", prescriptionController.updatePrescription.bind(prescriptionController));
  router.delete("/prescriptions/:prescriptionId", prescriptionController.deletePrescription.bind(prescriptionController));
  router.patch("/prescriptions/:prescriptionId/fill", prescriptionController.markAsFilled.bind(prescriptionController));

  return router;
} 
