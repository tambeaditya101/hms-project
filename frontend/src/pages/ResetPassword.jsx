import { useState } from "react";
import { useSelector } from "react-redux";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import api from "../utils/axios";

export default function ResetPassword() {
  const authUser = useSelector((s) => s.auth.user);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        userId: authUser.id,
        newPassword: password,
      });

      setSuccess("Password updated! Please login again.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent>
          <Typography variant="h5" className="font-bold mb-4 text-center">
            Reset Your Password
          </Typography>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="New Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Button
              fullWidth
              type="submit" // ← REQUIRED
              variant="contained"
              disabled={loading}
              className="!bg-blue-600 hover:!bg-blue-700"
            >
              {loading ? <CircularProgress size={20} /> : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
