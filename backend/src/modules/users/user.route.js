import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { handleCreateUser } from "./user.controller.js";

const router = Router();

// Only logged-in tenant users can access
router.post("/create", authenticate, enforceTenantAccess, handleCreateUser);

export default router;
