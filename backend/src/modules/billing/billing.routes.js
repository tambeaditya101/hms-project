import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

import {
  handleCreateBill,
  handleGetBills,
  handleGetPatientBills,
  handleAddPayment,
} from "./billing.controller.js";

const router = Router();

// CREATE BILL
router.post(
  "/create",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  handleCreateBill
);

// GET ALL BILLS
router.get(
  "/",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  handleGetBills
);

// GET BILLS FOR A PATIENT
router.get(
  "/patient/:patientId",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  handleGetPatientBills
);

// ADD PAYMENT TO BILL
router.post(
  "/:billId/pay",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  handleAddPayment
);

export default router;
