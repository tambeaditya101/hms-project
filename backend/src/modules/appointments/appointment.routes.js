import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

import {
  handleCreateAppointment,
  handleGetAppointments,
  handleGetDoctorAppointments,
  handleUpdateAppointmentStatus,
} from "./appointment.controller.js";

const router = Router();

// BOOK APPOINTMENT
router.post(
  "/create",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
  handleCreateAppointment
);

// LIST ALL TENANT APPOINTMENTS
router.get(
  "/",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
  handleGetAppointments
);

// LIST APPOINTMENTS FOR A SPECIFIC DOCTOR
router.get(
  "/doctor/:doctorId",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
  handleGetDoctorAppointments
);

// UPDATE APPOINTMENT STATUS (completed/cancelled)
router.patch(
  "/:id/status",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR"),
  handleUpdateAppointmentStatus
);

export default router;
