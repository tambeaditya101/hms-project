import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

import {
  handleCreatePatient,
  handleGetPatients,
} from "./patient.controller.js";

const router = Router();

// CREATE PATIENT
router.post(
  "/create",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR"),
  handleCreatePatient
);

// GET PATIENT LIST
router.get(
  "/",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
  handleGetPatients
);

export default router;
