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

  const redirectToLogin = () => navigate("/login");

  return (
    <Box className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <Card
        className="w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden"
        elevation={6}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT BRAND PANEL */}
          <div className="bg-blue-600 text-white flex flex-col justify-center items-center p-10">
            <LocalHospitalIcon sx={{ fontSize: 70 }} />

            <Typography variant="h4" className="font-bold mt-4 text-center">
              Register Your Hospital
            </Typography>

            <Typography className="opacity-90 mt-3 text-center text-sm leading-relaxed">
              Onboard your hospital into the HMS platform to manage patients,
              doctors, appointments, and billing — securely and efficiently.
            </Typography>
          </div>

          {/* RIGHT FORM PANEL */}
          <CardContent className="p-8">
            {!successData ? (
              <>
                <Typography
                  variant="h5"
                  className="font-bold text-center mb-6 text-gray-700"
                >
                  Hospital Onboarding
                </Typography>

                <form onSubmit={handleRegister} className="space-y-4">
                  <TextField
                    fullWidth
                    label="Hospital Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    label="Admin Email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    label="Admin Phone"
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
                  />

                  {error && <Alert severity="error">{error}</Alert>}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    className="!bg-blue-600 hover:!bg-blue-700 py-2"
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
                  Hospital Registered Successfully!
                </Alert>

                <Typography variant="h6" className="font-bold text-gray-700">
                  Admin Login Credentials
                </Typography>

                <Box className="mt-4 space-y-2">
                  <p>
                    <strong>Email:</strong> {successData.adminUser.email}
                  </p>
                  <p>
                    <strong>Username:</strong> {successData.adminUser.username}
                  </p>
                  <p>
                    <strong>Temporary Password:</strong>{" "}
                    {successData.adminUser.tempPassword}
                  </p>
                </Box>

                <Divider className="my-6" />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={redirectToLogin}
                  className="!bg-green-600 hover:!bg-green-700 py-2"
                >
                  Proceed to Login
                </Button>
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </Box>
  );
}
