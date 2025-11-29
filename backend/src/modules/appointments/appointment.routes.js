import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import {
  handleCreateAppointment,
  handleGetAppointments,
  handleGetDoctorAppointments,
  handleUpdateAppointmentStatus,
} from "./appointment.controller.js";

const router = Router();

// Book appointment
router.post(
  "/create",
  authenticate,
  enforceTenantAccess,
  handleCreateAppointment
);

// List all tenant appointments
router.get("/", authenticate, enforceTenantAccess, handleGetAppointments);

// List appointments for a specific doctor
router.get(
  "/doctor/:doctorId",
  authenticate,
  enforceTenantAccess,
  handleGetDoctorAppointments
);

// Update status (completed/cancelled)
router.patch(
  "/:id/status",
  authenticate,
  enforceTenantAccess,
  handleUpdateAppointmentStatus
);

export default router;
