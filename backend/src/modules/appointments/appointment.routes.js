// server/src/modules/appointments/appointment.routes.js
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

import {
  handleCreateAppointment,
  handleDeleteAppointment,
  handleGetAppointmentById,
  handleGetAppointments,
  handleGetDoctorAppointments,
  handleUpdateAppointment,
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

// GET APPT BY ID
router.get(
  "/:id",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
  handleGetAppointmentById
);

// FULL EDIT (ADMIN / RECEPTIONIST)
router.put(
  "/:id",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  handleUpdateAppointment
);

// STATUS update (doctor allowed)
router.put(
  "/:id/status",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR"),
  handleUpdateAppointmentStatus
);

// DELETE (ADMIN / RECEPTIONIST)
router.delete(
  "/:id",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  handleDeleteAppointment
);

// DOCTOR specific list
router.get(
  "/doctor/:doctorId",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
  handleGetDoctorAppointments
);

export default router;
