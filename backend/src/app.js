import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import tenantRoutes from "./modules/tenant/tenant.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

dotenv.config();

const app = express();

// Security + common middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "HMS backend running" });
});

// Routes
app.use("/api/tenants", tenantRoutes);
app.use("/api/auth", authRoutes);

export default app;
