import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

export default function CreateUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    status: "ACTIVE",
    roles: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const ROLE_OPTIONS = [
    "ADMIN",
    "DOCTOR",
    "NURSE",
    "PHARMACIST",
    "RECEPTIONIST",
    "ACCOUNTANT",
  ];
  const DEPARTMENT_OPTIONS = [
    "ADMINISTRATION",
    "CARDIOLOGY",
    "DERMATOLOGY",
    "ORTHOPEDICS",
    "PEDIATRICS",
    "RADIOLOGY",
    "NEUROLOGY",
    "GENERAL_MEDICINE",
    "EMERGENCY",
    "OPHTHALMOLOGY",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/users/create", form);

      setCreatedUser(res?.data?.user); // contains username + tempPassword
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff member");
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

              {/* DEPARTMENT */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select Department</MenuItem>
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

      {/* SUCCESS MODAL */}
      <Dialog open={!!createdUser} onClose={() => navigate("/users")}>
        <DialogTitle>User Created Successfully</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>Username:</strong> {createdUser?.username}
          </Typography>
          <Typography>
            <strong>Temporary Password:</strong> {createdUser?.tempPassword}
          </Typography>

          <Box className="mt-4 flex justify-end">
            <Button variant="contained" onClick={() => navigate("/users")}>
              Done
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
