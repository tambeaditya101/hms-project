import { WarningAmber } from "@mui/icons-material";

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="bg-white shadow-lg rounded-lg p-10 text-center max-w-md">
        <div className="flex justify-center mb-4">
          <WarningAmber className="text-red-500" sx={{ fontSize: 60 }} />
        </div>

        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>

        <p className="text-gray-600 mb-6">
          You do not have permission to view this page. Please contact your
          administrator if you think this is a mistake.
        </p>
      </div>
    </div>
  );
}
