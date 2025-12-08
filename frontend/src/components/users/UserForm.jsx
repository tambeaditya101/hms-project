// src/components/users/UserForm.jsx

import {
  Grid,
  TextField,
  MenuItem,
  Alert,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Box,
  Typography,
} from "@mui/material";

import UserRoleChips from "./UserRoleChips";
import { ROLE_OPTIONS, STATUS_OPTIONS, DEPARTMENT_OPTIONS } from "./constants";

export default function UserForm({
  form,
  setForm,
  error,
  loading,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  if (!form) return null;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleRole = (role) =>
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));

  return (
    <Card className="shadow-lg">
      <CardContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* FIRST NAME */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                required
                value={form.firstName}
                onChange={handleChange}
              />
            </Grid>

            {/* LAST NAME */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                value={form.lastName}
                onChange={handleChange}
              />
            </Grid>

            {/* EMAIL */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email"
                name="email"
                fullWidth
                required
                value={form.email}
                onChange={handleChange}
              />
            </Grid>

            {/* PHONE */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                value={form.phone}
                onChange={handleChange}
              />
            </Grid>

            {/* USERNAME (ONLY FOR EDIT USER) */}
            {"username" in form && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Username"
                  name="username"
                  fullWidth
                  InputProps={{ readOnly: true }}
                  value={form.username}
                />
              </Grid>
            )}

            {/* DEPARTMENT */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Department"
                name="department"
                fullWidth
                value={form.department}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  Select Department
                </MenuItem>
                {DEPARTMENT_OPTIONS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* ROLES */}
            <Grid size={{ xs: 12 }}>
              <UserRoleChips
                roles={form.roles}
                onToggle={toggleRole}
                options={ROLE_OPTIONS}
              />
            </Grid>

            {/* STATUS */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
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

            {/* ERROR */}
            {error && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* ACTION BUTTONS */}
            <Grid size={{ xs: 12 }} className="mt-4 flex gap-4">
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                className="!bg-blue-600 hover:!bg-blue-700"
              >
                {loading ? (
                  <CircularProgress size={22} className="text-white" />
                ) : (
                  submitLabel
                )}
              </Button>

              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
