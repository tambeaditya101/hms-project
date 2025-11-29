import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import {
  handleCreateBill,
  handleGetBills,
  handleGetPatientBills,
  handleAddPayment,
} from "./billing.controller.js";

const router = Router();

router.post("/create", authenticate, enforceTenantAccess, handleCreateBill);

router.get("/", authenticate, enforceTenantAccess, handleGetBills);

router.get(
  "/patient/:patientId",
  authenticate,
  enforceTenantAccess,
  handleGetPatientBills
);

router.post(
  "/:billId/pay",
  authenticate,
  enforceTenantAccess,
  handleAddPayment
);

export default router;
