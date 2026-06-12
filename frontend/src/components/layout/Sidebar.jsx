// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROLES } from "../users/userConstants";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.ACCOUNTANT],
  },
  {
    label: "Patients",
    path: "/patients",
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  },
  {
    label: "Appointments",
    path: "/appointments",
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  },
  {
    label: "Prescriptions",
    path: "/prescriptions",
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PHARMACIST],
  },
  {
    label: "Billing",
    path: "/billing",
    roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.ACCOUNTANT],
  },
  {
    label: "Users",
    path: "/users",
    roles: [ROLES.ADMIN],
  },
];

export default function Sidebar() {
  const userRoles = useSelector((state) => state.auth.user?.roles || []);

  const visibleItems = menuItems.filter((item) =>
    item.roles.some((role) => userRoles.includes(role))
  );

  return (
    <aside
      className="
        fixed left-0 top-0 
        w-64 h-screen 
        bg-white 
        border-r border-gray-200 
        flex flex-col 
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-bold">HMS</h2>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto pt-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
                block px-6 py-3 text-sm font-medium
                transition-all
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
