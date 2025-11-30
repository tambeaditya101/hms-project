import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js"; // <-- Missing earlier
import { handleCreateUser, handleGetUsers } from "./user.controller.js";

const router = Router();

// CREATE USER (Hospital Admin only)
router.post(
  "/create",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN"), // Only ADMIN can create users
  handleCreateUser
);

// GET ALL USERS (Tenant scoped)
router.get(
  "/",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN"), // Only ADMIN can list all users
  handleGetUsers
);

export default router;
