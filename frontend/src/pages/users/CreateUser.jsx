import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { useSelector } from "react-redux";

export default function CreateUser() {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // Backend required fields
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    department: "",
    status: "ACTIVE",
    roles: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Backend-safe Lists
  const ROLE_OPTIONS = [
    "HOSPITAL_ADMIN",
    "DOCTOR",
    "NURSE",
    "RECEPTIONIST",
    "CHEMIST",
    "ACCOUNTANT",
  ];

  const DEPARTMENT_OPTIONS = [
    "ADMINISTRATION",
    "CARDIOLOGY",
    "ORTHOPEDICS",
    "PEDIATRICS",
    "GENERAL",
    "NURSING",
  ];

  const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "LOCKED"];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleRole = (role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const generatePassword = () => {
    const random = Math.random().toString(36).slice(-8);
    setForm((prev) => ({ ...prev, password: `Pass@${random}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        password: form.password || undefined, // backend will auto-generate if undefined
      };

      await api.post("/users/create", payload);
      navigate("/users");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">
        Add New Staff Member
      </Typography>

      <Card className="shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* FIRST NAME */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </Grid>

              {/* LAST NAME */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </Grid>

              {/* EMAIL */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </Grid>

              {/* PHONE */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </Grid>

              {/* USERNAME */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
              </Grid>

              {/* PASSWORD + auto-generate */}
              <Grid item xs={12} md={6}>
                <Box className="flex gap-2 items-center">
                  <TextField
                    fullWidth
                    label="Password (optional)"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <Button variant="outlined" onClick={generatePassword}>
                    Auto
                  </Button>
                </Box>
              </Grid>

              {/* DEPARTMENT */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* STATUS */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* ROLES MULTI-SELECT */}
              <Grid item xs={12}>
                <Typography className="font-semibold mb-2">
                  Assign Roles
                </Typography>

                <Box className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      clickable
                      color={form.roles.includes(role) ? "primary" : "default"}
                      onClick={() => toggleRole(role)}
                    />
                  ))}
                </Box>
              </Grid>

              {/* ERROR */}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {/* Submit */}
              <Grid item xs={12} className="mt-4 flex gap-4">
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  className="!bg-blue-600 hover:!bg-blue-700"
                >
                  {loading ? (
                    <CircularProgress size={22} className="text-white" />
                  ) : (
                    "Create User"
                  )}
                </Button>

                <Button variant="outlined" onClick={() => navigate("/users")}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
