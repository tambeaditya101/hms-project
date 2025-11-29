import { Router } from "express";
import { handleRegisterTenant } from "./tenant.controller.js";

const router = Router();

router.post("/register", handleRegisterTenant);

export default router;
