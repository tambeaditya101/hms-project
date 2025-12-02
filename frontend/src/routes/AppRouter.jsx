import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import TenantRegister from "../pages/TenantRegister";
import Unauthorized from "../pages/Unauthorized";
import PatientsList from "../pages/patients/PatientsList";
import PatientDetails from "../pages/patients/PatientDetails";
import CreatePatient from "../pages/patients/CreatePatient";
import AppointmentsList from "../pages/appointments/AppointmentsList";
import CreateAppointment from "../pages/appointments/CreateAppointment";

const Prescriptions = () => <h1>Prescriptions</h1>;
const Billing = () => <h1>Billing</h1>;
const Users = () => <h1>Users</h1>;

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
              <PatientsList />
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
        <Route
          path="/patients/create"
          element={
            <ProtectedRoute>
              <CreatePatient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute>
              <PatientDetails />
            </ProtectedRoute>
          }
        />
        // inside the protected "/" layout route:
        <Route
          path="appointments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "RECEPTIONIST"]}>
              <AppointmentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="appointments/create"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
              <CreateAppointment />
            </ProtectedRoute>
          }
        />
        {/* UNAUTHORIZED */}
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>
    </Routes>
  );
}
