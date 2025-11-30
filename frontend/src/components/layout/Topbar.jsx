import { AppBar, Toolbar, Typography, Box, Button, Chip } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

export default function Topbar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const hospitalName = user?.tenantName || "Hospital Management System";
  const role = user?.roles?.[0] || "USER";

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
          {/* Role badge */}
          <Chip
            label={role}
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
