import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/axios";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";

import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });

      const { token, user, mustResetPassword } = res.data;
      dispatch(setCredentials({ token, user }));

      if (mustResetPassword) {
        navigate("/reset-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <Card
        className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden"
        elevation={6}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Banner */}
          <div className="bg-blue-600 text-white flex flex-col justify-center items-center p-10">
            <LocalHospitalIcon sx={{ fontSize: 70 }} />

            <Typography variant="h4" className="font-bold mt-4 text-center">
              Hospital Management System
            </Typography>

            <Typography className="opacity-90 mt-2 text-center">
              Secure login for hospital staff & administrators.
            </Typography>
          </div>

          {/* Right Login Form */}
          <CardContent className="p-8">
            <Typography
              variant="h5"
              className="font-bold text-center mb-6 text-gray-700"
            >
              Welcome Back
            </Typography>

            <form onSubmit={handleLogin} className="space-y-4">
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

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
                  "Login"
                )}
              </Button>
            </form>

            <Divider className="my-6" />

            <Typography className="text-center text-sm text-gray-600">
              New hospital?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register your hospital
              </Link>
            </Typography>
          </CardContent>
        </div>
      </Card>
    </Box>
  );
}
