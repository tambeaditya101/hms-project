import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login";
import TenantRegister from "../pages/TenantRegister";
import { ROUTES } from "../config/routes";
import Unauthorized from "../pages/Unauthorized";

export default function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<TenantRegister />} />

      {/* PROTECTED LAYOUT */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* AUTO-GENERATED ROUTES */}
        {ROUTES.map((r) => {
          const Component = r.element;

          return (
            <Route
              key={r.path || "index"}
              index={!!r.index}
              path={r.path}
              element={
                r.roles === "ANY" ? (
                  <Component />
                ) : (
                  <ProtectedRoute allowedRoles={r.roles}>
                    <Component />
                  </ProtectedRoute>
                )
              }
            />
          );
        })}

        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>
    </Routes>
  );
}
