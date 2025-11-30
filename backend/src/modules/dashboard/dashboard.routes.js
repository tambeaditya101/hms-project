import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";
import { handleDashboardSummary } from "./dashboard.controller.js";

const router = Router();

router.get(
  "/summary",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  handleDashboardSummary
);

export default router;
