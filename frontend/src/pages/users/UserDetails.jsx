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
} from "@mui/material";
import api from "../../utils/axios";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      const res = await api.get("/users", { params: { id } });

      const list = res.data?.users || [];
      const matched = list.find((u) => u.id === id);

      if (!matched) {
        setError("User not found");
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
    fetchUser();
  }, []);

  if (loading)
    return (
      <Box className="flex justify-center p-10">
        <CircularProgress />
      </Box>
    );

  if (error || !user)
    return (
      <Box className="p-6">
        <Alert severity="error">{error || "User not found"}</Alert>
      </Box>
    );

  return (
    <Box className="p-6">
      {/* Title */}
      <Typography variant="h4" className="font-bold mb-4">
        Staff Member Details
      </Typography>

      {/* Profile Card */}
      <Card className="shadow-lg mb-6">
        <CardContent>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" className="font-bold">
                {user?.firstName} {user?.lastName}
              </Typography>

              <p className="text-gray-600">{user?.email}</p>
              <p className="text-gray-600">Username: {user?.username}</p>
              <p className="text-gray-600">Phone: {user?.phone || "—"}</p>

              <Chip
                label={user?.status}
                color={
                  user?.status === "ACTIVE"
                    ? "success"
                    : user?.status === "LOCKED"
                    ? "error"
                    : "warning"
                }
                className="mt-2"
              />
            </Grid>

            {/* Department & Roles */}
            <Grid item xs={12} md={4}>
              <p>
                <strong>Department:</strong>{" "}
                {user?.department || "Not assigned"}
              </p>

              <p className="mt-3">
                <strong>Roles:</strong>
              </p>
              <Box className="flex flex-wrap gap-2 mt-2">
                {user?.roles?.length ? (
                  user.roles.map((role) => (
                    <Chip key={role} label={role} color="primary" />
                  ))
                ) : (
                  <Chip label="No roles assigned" />
                )}
              </Box>
            </Grid>

            {/* Metadata */}
            <Grid item xs={12} md={4}>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(user?.createdAt).toLocaleString()}
              </p>

              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(user?.updatedAt).toLocaleString()}
              </p>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ACTION BUTTONS */}
      <Box className="flex gap-4">
        <Button
          variant="contained"
          className="!bg-blue-600 hover:!bg-blue-700"
          onClick={() => navigate(`/users/${id}/edit`)}
        >
          Edit User
        </Button>

        <Button variant="outlined" onClick={() => navigate("/users")}>
          Back to Users
        </Button>
      </Box>
    </Box>
  );
}
