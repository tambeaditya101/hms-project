import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import tenantRoutes from "./modules/tenant/tenant.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import patientRoutes from "./modules/patients/patient.routes.js";
import prescriptionRoutes from "./modules/prescriptions/prescription.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import appointmentRoutes from "./modules/appointments/appointment.routes.js";
import billingRoutes from "./modules/billing/billing.routes.js";

// Middleware
import { authenticate } from "./middleware/auth.middleware.js";
import { enforceTenantAccess } from "./middleware/tenant.middleware.js";

const app = express();

/* ----------------------------------------
   GLOBAL MIDDLEWARES
----------------------------------------- */
app.use(helmet());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

/* ----------------------------------------
   DEBUG ROUTES (optional, safe)
----------------------------------------- */
app.get("/debug/health-app", (_req, res) => {
  res.json({ status: "OK", message: "HMS backend running" });
});

app.get("/debug/auth-test", authenticate, enforceTenantAccess, (req, res) => {
  res.json({
    message: "Debug route working",
    user: req.user,
    tenantId: req.tenantId,
  });
});

/* ----------------------------------------
   MAIN ROUTES
----------------------------------------- */
app.use("/api/tenants", tenantRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/billing", billingRoutes);

/* ----------------------------------------
   404 HANDLER
----------------------------------------- */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* ----------------------------------------
   GLOBAL ERROR HANDLER
----------------------------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
