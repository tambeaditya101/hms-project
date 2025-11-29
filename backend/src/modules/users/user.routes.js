import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { handleCreateUser, handleGetUsers } from "./user.controller.js";

const router = Router();

// CREATE USER (Hospital Admin only)
router.post("/create", authenticate, enforceTenantAccess, handleCreateUser);

// GET ALL USERS (Tenant scoped)
router.get("/", authenticate, enforceTenantAccess, handleGetUsers);

export default router;
