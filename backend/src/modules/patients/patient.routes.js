import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { enforceTenantAccess } from "../../middleware/tenant.middleware.js";
import {
  handleCreatePatient,
  handleGetPatients,
} from "./patient.controller.js";

const router = Router();

router.post("/create", authenticate, enforceTenantAccess, handleCreatePatient);

router.get("/", authenticate, enforceTenantAccess, handleGetPatients);

export default router;
