import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import {
  handleCreatePrescription,
  handleGetPatientPrescriptions,
} from "./prescription.controller.js";

const router = Router();

// Create prescription
router.post(
  "/create",
  authenticate,
  enforceTenantAccess,
  handleCreatePrescription
);

// Get all prescriptions for a patient
router.get(
  "/patient/:patientId",
  authenticate,
  enforceTenantAccess,
  handleGetPatientPrescriptions
);

export default router;
