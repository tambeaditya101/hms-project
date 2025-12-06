import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  Chip,
} from "@mui/material";
import api from "../../utils/axios";

const ROLE_OPTIONS = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "PHARMACIST",
  "ACCOUNTANT",
];

const DEPARTMENT_OPTIONS = [
  "ADMINISTRATION",
  "OPD",
  "IPD",
  "EMERGENCY",
  "PHARMACY",
  "BILLING",
  "GENERAL_MEDICINE",
  "CARDIOLOGY",
  "ORTHOPEDICS",
  "PEDIATRICS",
  "GYNECOLOGY",
];

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    department: "",
    roles: [],
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing user data
  const fetchUser = async () => {
    try {
      const res = await api.get("/users", { params: { id } });

      const list = res.data?.users || [];
      const user = list.find((u) => u.id === id);

      if (!user) {
        setError("User not found");
      }

      setForm({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        username: user?.username || "",
        department: user?.department || "",
        roles: user?.roles || [],
        status: user?.status || "ACTIVE",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const handleRoleToggle = (role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put(`/users/${id}`, form);
      navigate(`/users/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center p-10">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box className="p-6">
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">
        Edit Staff Member
      </Typography>

      <Card className="shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* First & Last Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  fullWidth
                  required
                  value={form.firstName}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  fullWidth
                  value={form.lastName}
                  onChange={handleChange}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  name="email"
                  fullWidth
                  value={form.email}
                  onChange={handleChange}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  fullWidth
                  value={form.phone}
                  onChange={handleChange}
                />
              </Grid>

              {/* Username (readonly) */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Username"
                  name="username"
                  fullWidth
                  value={form.username}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
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

              {/* Roles Multi-select */}
              <Grid item xs={12}>
                <Typography className="mb-2 font-semibold">
                  Assign Roles
                </Typography>

                <Box className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      clickable
                      onClick={() => handleRoleToggle(role)}
                      color={form.roles.includes(role) ? "primary" : "default"}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Status"
                  name="status"
                  fullWidth
                  value={form.status}
                  onChange={handleChange}
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  <MenuItem value="LOCKED">LOCKED</MenuItem>
                </TextField>
              </Grid>

              {/* Error */}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {/* Action Buttons */}
              <Grid item xs={12} className="flex gap-4 mt-4">
                <Button
                  variant="contained"
                  type="submit"
                  disabled={saving}
                  className="!bg-blue-600 hover:!bg-blue-700"
                >
                  {saving ? (
                    <CircularProgress size={22} className="text-white" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate(`/users/${id}`)}
                >
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
