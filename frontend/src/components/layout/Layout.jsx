import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex">
      {/* FIXED SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 ml-64">
        {/* FIXED TOP BAR */}
        <Topbar />

        {/* CONTENT */}
        <main className="pt-20 p-6 min-h-screen bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
