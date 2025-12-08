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

      navigate(mustResetPassword ? "/reset-password" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="
        min-h-screen 
        flex 
        items-center 
        justify-center 
        bg-gradient-to-br 
        from-blue-50 
        to-blue-200 
        p-6
      "
    >
      <Card
        elevation={10}
        className="
          w-full 
          max-w-4xl
          rounded-3xl 
          overflow-hidden 
          border border-gray-200
          shadow-[0_10px_40px_rgba(0,0,0,0.15)]
          backdrop-blur-xl
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT BRAND PANEL */}
          <Box
            className="
              bg-gradient-to-br 
              from-blue-600 
              to-blue-700 
              text-white 
              flex 
              flex-col 
              justify-center 
              items-center 
              p-10 
              relative
            "
          >
            {/* Soft glow background */}
            <div
              className="
                absolute 
                inset-0 
                opacity-20 
                bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]
              "
            />

            <LocalHospitalIcon
              sx={{ fontSize: 80 }}
              className="drop-shadow-2xl"
            />

            <Typography
              variant="h4"
              className="
                font-extrabold 
                mt-4 
                text-center 
                drop-shadow 
                leading-tight
              "
            >
              Hospital Management System
            </Typography>

            <Typography className="opacity-90 mt-3 text-center text-sm leading-relaxed">
              A secure login gateway for hospital administrators and staff.
            </Typography>
          </Box>

          {/* RIGHT LOGIN FORM */}
          <CardContent className="p-10 bg-white">
            <Typography
              variant="h5"
              className="font-bold text-center mb-6 text-gray-800"
            >
              Welcome Back
            </Typography>

            <form onSubmit={handleLogin} className="space-y-5">
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="
                  !bg-blue-600 
                  hover:!bg-blue-700 
                  py-2.5 
                  text-base 
                  font-semibold 
                  rounded-lg 
                  transition-all 
                  duration-200
                "
              >
                {loading ? (
                  <CircularProgress size={24} className="text-white" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <Divider className="my-6" />

            <Typography className="text-center text-sm text-gray-600">
              New hospital?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Register here
              </Link>
            </Typography>
          </CardContent>
        </div>
      </Card>
    </Box>
  );
}
