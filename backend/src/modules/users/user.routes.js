import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";

import {
  handleCreateUser,
  handleGetUsers,
  handleUpdateUser,
  handleDeleteUser,
  handleGetDoctors,
} from "./user.controller.js";

const router = Router();

// CREATE USER (Hospital Admin only)
router.post(
  "/create",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN"),
  handleCreateUser
);

// GET ALL USERS (Tenant Scoped)
router.get(
  "/",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN"),
  handleGetUsers
);

// UPDATE USER
router.put(
  "/:id",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN"),
  handleUpdateUser
);

// DELETE USER
router.delete(
  "/:id",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN"),
  handleDeleteUser
);

router.get(
  "/doctors",
  authenticate,
  enforceTenantAccess,
  authorizeRoles("ADMIN", "RECEPTIONIST", "NURSE", "DOCTOR"),
  handleGetDoctors
);

export default router;
