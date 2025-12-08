import { useState } from "react";
import api from "../utils/axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

export default function TenantRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    licenseNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/tenants/register", form);
      setSuccessData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-4">
      <Card
        elevation={10}
        className="
          w-full 
          max-w-5xl 
          rounded-3xl 
          overflow-hidden 
          border border-gray-200 
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
        "
      >
        <Box className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT PANEL */}
          <Box
            className="
              bg-gradient-to-br from-blue-600 to-blue-700
              text-white 
              flex flex-col 
              justify-center 
              items-center 
              p-10 
              relative
            "
          >
            {/* Decorative gradient bubble */}
            <Box
              className="
                absolute inset-0 opacity-20 pointer-events-none
                bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] 
              "
            />

            <LocalHospitalIcon
              sx={{ fontSize: 75 }}
              className="drop-shadow-xl"
            />

            <Typography
              variant="h4"
              className="font-extrabold mt-5 text-center leading-snug drop-shadow-md"
            >
              Hospital Onboarding Portal
            </Typography>

            <Typography className="opacity-90 mt-4 text-center text-sm leading-relaxed max-w-xs">
              Register your hospital on our multi-tenant HMS platform and get
              instant access to patient management, appointment flows, billing,
              and staff management tools.
            </Typography>
          </Box>

          {/* RIGHT FORM PANEL */}
          <CardContent className="p-10 bg-white">
            {!successData ? (
              <>
                <Typography
                  variant="h5"
                  className="font-bold text-center mb-6 text-gray-700"
                >
                  Create Hospital Profile
                </Typography>

                <form onSubmit={handleRegister} className="space-y-5">
                  <TextField
                    fullWidth
                    label="Official Hospital Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Full Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Admin Email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Admin Phone Number"
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                  />

                  <TextField
                    fullWidth
                    label="License Number"
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    required
                  />

                  {error && (
                    <Alert severity="error" className="mt-2">
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    className="!bg-blue-600 hover:!bg-blue-700 py-2.5 rounded-lg text-base font-semibold"
                  >
                    {loading ? (
                      <CircularProgress size={24} className="text-white" />
                    ) : (
                      "Register Hospital"
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* SUCCESS SCREEN */}
                <Alert severity="success" className="mb-4">
                  🎉 Hospital registered successfully!
                </Alert>

                <Typography variant="h6" className="font-bold text-gray-700">
                  Admin Login Credentials
                </Typography>

                <Box className="mt-4 space-y-2 bg-gray-50 border p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> {successData.adminUser.email}
                  </p>
                  <p>
                    <strong>Username:</strong> {successData.adminUser.username}
                  </p>
                  <p>
                    <strong>Password:</strong>{" "}
                    <span className="text-blue-600 font-bold">
                      {successData.adminUser.tempPassword}
                    </span>
                  </p>
                </Box>

                <Divider className="my-6" />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate("/login")}
                  className="!bg-green-600 hover:!bg-green-700 py-2.5 rounded-lg text-base font-semibold"
                >
                  Proceed to Login
                </Button>
              </>
            )}
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
}
