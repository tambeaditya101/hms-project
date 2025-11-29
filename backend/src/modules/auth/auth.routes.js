import { Router } from "express";
import { handleLogin } from "./auth.controller.js";

const router = Router();

router.post("/login", handleLogin);

export default router;
