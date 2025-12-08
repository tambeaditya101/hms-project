// FIXED USER DETAILS COMPONENT — VALID FOR MUI GRID v2

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import api from "../../utils/axios";

const STATUS_COLORS = {
  ACTIVE: "success",
  INACTIVE: "warning",
  LOCKED: "error",
};

const ROLE_COLORS = {
  ADMIN: "primary",
  DOCTOR: "success",
  NURSE: "secondary",
  RECEPTIONIST: "warning",
  CHEMIST: "info",
  ACCOUNTANT: "default",
};

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users", { params: { id } });

      const matched = res.data?.users?.find((u) => u.id === id);
      if (!matched) return setError("User not found");

      setUser(matched);
    } catch (e) {
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const getInitials = (f, l) => `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      navigate("/users");
    } catch (e) {
      alert("Failed to delete user");
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center min-h-[300px]">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box className="p-6">
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate("/users")}>
          Back
        </Button>
      </Box>
    );

  return (
    <Box className="p-6">
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Staff Member Details
      </Typography>

      {/* PROFILE SUMMARY */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Avatar
            sx={{
              width: 70,
              height: 70,
              bgcolor: "primary.main",
              fontSize: "1.8rem",
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight="600">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Chip
              label={user.status}
              color={STATUS_COLORS[user.status] || "default"}
              sx={{ mt: 1 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* DETAILS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* BASIC INFO */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Basic Information
              </Typography>

              <Stack spacing={1.5}>
                <Detail label="Username" value={user.username} />
                <Detail label="Phone" value={user.phone || "—"} />
                <Detail label="Department" value={user.department || "—"} />
              </Stack>
            </Grid>

            {/* ROLES */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Roles
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {user.roles?.length ? (
                  user.roles.map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      color={ROLE_COLORS[r] || "default"}
                    />
                  ))
                ) : (
                  <Chip label="No roles assigned" variant="outlined" />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* METADATA */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" mb={2}>
            Metadata
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Detail label="Created At" value={formatDate(user.createdAt)} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Detail label="Updated At" value={formatDate(user.updatedAt)} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ACTION BUTTONS */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="contained"
          onClick={() => navigate(`/users/${id}/edit`)}
        >
          Edit User
        </Button>

        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete User
        </Button>
      </Box>
    </Box>
  );
}

function Detail({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}
