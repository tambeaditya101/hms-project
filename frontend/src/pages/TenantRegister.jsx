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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

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
    <Box className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-xl shadow-xl">
        <CardContent>
          <Typography variant="h5" className="text-center font-bold mb-6">
            Register Your Hospital
          </Typography>

          {!successData ? (
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
                className="!bg-blue-600 hover:!bg-blue-700"
              >
                {loading ? (
                  <CircularProgress size={24} className="text-white" />
                ) : (
                  "Register Hospital"
                )}
              </Button>
            </form>
          ) : (
            <Box className="space-y-4">
              <Alert severity="success">
                Hospital Registered Successfully!
              </Alert>

              <Typography variant="h6" className="mt-4">
                Admin Login Credentials
              </Typography>
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

              <Button
                fullWidth
                variant="contained"
                onClick={redirectToLogin}
                className="!bg-green-600 hover:!bg-green-700 mt-4"
              >
                Go to Login
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
