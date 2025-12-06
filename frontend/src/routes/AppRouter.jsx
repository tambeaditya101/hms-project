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
import EditUser from "../pages/users/EditUser";
import UserDetails from "../pages/users/UserDetails";
import CreateUser from "../pages/users/CreateUser";
import UsersList from "../pages/users/UsersList";
import ResetPassword from "../pages/ResetPassword";

const Prescriptions = () => <h1>Prescriptions</h1>;
const Billing = () => <h1>Billing</h1>;

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
        /* USERS MODULE ROUTES */
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/create"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CreateUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <EditUser />
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
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        {/* UNAUTHORIZED */}
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>
    </Routes>
  );
}
