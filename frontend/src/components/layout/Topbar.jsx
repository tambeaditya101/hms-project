import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

export default function Topbar() {
  const dispatch = useDispatch();

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h3 className="text-lg font-semibold">Hospital Management System</h3>

      <button
        onClick={() => dispatch(logout())}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
