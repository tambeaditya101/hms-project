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
      setError("");
      const res = await api.get("/users", { params: { id } });

      const list = res.data?.users || [];
      const matched = list.find((u) => u.id === id);

      if (!matched) {
        setError("User not found");
        return;
      }

      setUser(matched);
    } catch (err) {
      console.error(err);
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.log(e);

      return "Invalid date";
    }
  };

  const getInitials = (firstName, lastName) => {
    const f = firstName?.[0] || "";
    const l = lastName?.[0] || "";
    return `${f}${l}`.toUpperCase();
  };

  if (loading)
    return (
      <Box className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </Box>
    );

  if (error || !user)
    return (
      <Box className="p-6">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "User not found"}
        </Alert>
        <Button variant="outlined" onClick={() => navigate("/users")}>
          Back to Users
        </Button>
      </Box>
    );

  return (
    <Box className="p-6">
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight="bold">
          Staff Member Details
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/users")}>
          Back to Users
        </Button>
      </Box>

      {/* Profile Card */}
      <Card className="shadow-lg mb-6">
        <CardContent sx={{ p: 4 }}>
          {/* User Header Section */}
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Chip
                label={user.status || "UNKNOWN"}
                color={STATUS_COLORS[user.status] || "default"}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Information Grid */}
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                fontWeight="600"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Username
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {user.username || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Phone
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {user.phone || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Department
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {user.department || "Not assigned"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Roles */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                fontWeight="600"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Roles
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      color={ROLE_COLORS[role] || "default"}
                      size="medium"
                      sx={{ fontWeight: 500 }}
                    />
                  ))
                ) : (
                  <Chip
                    label="No roles assigned"
                    color="default"
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>

            {/* Metadata */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                fontWeight="600"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Metadata
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Created At
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Last Updated
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {formatDate(user.updatedAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="contained"
          className="!bg-blue-600 hover:!bg-blue-700"
          onClick={() => navigate(`/users/${id}/edit`)}
        >
          Edit User
        </Button>
      </Box>
    </Box>
  );
}
