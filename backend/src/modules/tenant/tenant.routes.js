import { Router } from "express";
import { handleGetTenant, handleRegisterTenant } from "./tenant.controller.js";

const router = Router();

router.post("/register", handleRegisterTenant);

// Get tenant details by ID
router.get("/:tenantId", handleGetTenant);

export default router;
