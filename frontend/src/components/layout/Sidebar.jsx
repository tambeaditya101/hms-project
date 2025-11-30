import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/" },
  { label: "Patients", path: "/patients" },
  { label: "Appointments", path: "/appointments" },
  { label: "Prescriptions", path: "/prescriptions" },
  { label: "Billing", path: "/billing" },
  { label: "Users", path: "/users" },
];

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      <h2 className="text-xl font-bold px-6 py-4 border-b">HMS</h2>

      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-6 py-3 text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
