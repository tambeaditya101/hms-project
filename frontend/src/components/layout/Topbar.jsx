import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

export default function Topbar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  console.log(user);

  const hospitalName = user?.tenantName || "Hospital Management System";
  const department = user?.department || "User";

  // Get user's full name
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName =
    `${firstName} ${lastName}`.trim() || user?.username || "User";

  // Get initials for avatar
  const getInitials = (first, last) => {
    const f = first?.[0] || "";
    const l = last?.[0] || "";
    return (
      `${f}${l}`.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"
    );
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Branding Section */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1976d2",
              letterSpacing: "0.3px",
            }}
          >
            {hospitalName}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "#6b7280", fontSize: "0.72rem" }}
          >
            Multi-Tenant Hospital Management System
          </Typography>
        </Box>

        {/* Right User Info */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* User Name and Avatar */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {getInitials(firstName, lastName)}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                display: { xs: "none", sm: "block" }, // Hide on mobile, show on larger screens
              }}
            >
              {fullName}
            </Typography>
          </Box>

          {/* Department badge */}
          <Chip
            label={department}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          />

          {/* Logout Button */}
          <Button
            variant="contained"
            color="error"
            onClick={() => dispatch(logout())}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
