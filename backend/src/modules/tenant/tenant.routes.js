import { Router } from "express";
import { handleRegisterTenant, handleGetTenant } from "./tenant.controller.js";

const router = Router();

// Register a new tenant (hospital onboarding)
router.post("/register", handleRegisterTenant);

// Get tenant details
router.get("/:tenantId", handleGetTenant);

export default router;
