// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/" },
  { label: "Patients", path: "/patients" },
  { label: "Appointments", path: "/appointments" },
  // { label: "Prescriptions", path: "/prescriptions" },
  // { label: "Billing", path: "/billing" },
  { label: "Users", path: "/users" },
];

export default function Sidebar() {
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
        {menuItems.map((item) => (
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
