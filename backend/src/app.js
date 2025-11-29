import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import tenantRoutes from "./modules/tenant/tenant.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import patientRoutes from "./modules/patients/patient.routes.js";
import prescriptionRoutes from "./modules/prescriptions/prescription.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

import { authenticate } from "./middleware/auth.middleware.js";
import { enforceTenantAccess } from "./middleware/tenant.middleware.js";

dotenv.config();

const app = express();

// Security + common middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health Check
app.get("/debug/health-app", (req, res) => {
  res.json({ status: "OK", message: "HMS backend running" });
});

app.get("/debug/auth-test", authenticate, enforceTenantAccess, (req, res) => {
  res.json({
    message: "Debug route working",
    user: req.user,
    tenantId: req.tenantId,
  });
});

// Routes
app.use("/api/tenants", tenantRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;
