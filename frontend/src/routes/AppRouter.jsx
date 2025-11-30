import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import TenantRegister from "../pages/TenantRegister";
import Unauthorized from "../pages/Unauthorized";

// Dummy pages
const Patients = () => <h1>Patients</h1>;
const Appointments = () => <h1>Appointments</h1>;
const Prescriptions = () => <h1>Prescriptions</h1>;
const Billing = () => <h1>Billing</h1>;
const Users = () => <h1>Users</h1>;
// const Unauthorized = () => <h1>Unauthorized</h1>;

export default function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<TenantRegister />} />

      {/* PROTECTED LAYOUT (ALWAYS SHOW SIDEBAR + TOPBAR) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* DASHBOARD */}
        <Route
          index
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* PATIENTS */}
        <Route
          path="patients"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "NURSE"]}>
              <Patients />
            </ProtectedRoute>
          }
        />

        {/* APPOINTMENTS */}
        <Route
          path="appointments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "RECEPTIONIST"]}>
              <Appointments />
            </ProtectedRoute>
          }
        />

        {/* PRESCRIPTIONS */}
        <Route
          path="prescriptions"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "PHARMACIST"]}>
              <Prescriptions />
            </ProtectedRoute>
          }
        />

        {/* BILLING */}
        <Route
          path="billing"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Billing />
            </ProtectedRoute>
          }
        />

        {/* USERS */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* UNAUTHORIZED */}
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>
    </Routes>
  );
}
