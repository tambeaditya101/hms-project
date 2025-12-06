import { Router } from "express";
import { handleLogin } from "./auth.controller.js";
import { resetPassword } from "./resetPassword.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/login", handleLogin);

// Requires authenticated user
router.post("/reset-password", authenticate, resetPassword);

export default router;
