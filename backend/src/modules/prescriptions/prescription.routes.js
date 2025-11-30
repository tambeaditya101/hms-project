import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

import {
  handleCreatePrescription,
  handleGetPatientPrescriptions,
} from "./prescription.controller.js";

const router = Router();

// CREATE PRESCRIPTION (doctor only)
router.post(
  "/create",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("DOCTOR"), // Strict
  handleCreatePrescription
);

// GET PRESCRIPTIONS FOR A PATIENT
router.get(
  "/patient/:patientId",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "DOCTOR", "NURSE", "PHARMACIST"),
  handleGetPatientPrescriptions
);

export default router;
