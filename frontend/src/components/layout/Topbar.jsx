import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { useEffect, useState } from "react";
import api from "../../utils/axios";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function Topbar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [tenantName, setTenantName] = useState("Hospital Management System");
  const [anchorEl, setAnchorEl] = useState(null);

  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const department = user?.department || "User";

  // Fetch tenant name
  useEffect(() => {
    async function fetchTenant() {
      if (!user?.tenantId) return;

      try {
        const res = await api.get(`/tenants/${user.tenantId}`);
        setTenantName(res?.data?.tenant?.name || "Hospital Management System");
      } catch (err) {
        console.error("Failed to fetch tenant name", err);
      }
    }

    fetchTenant();
  }, [user?.tenantId]);

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const fullName =
    `${firstName} ${lastName}`.trim() || user?.username || "User";

  const getInitials = (first, last) => {
    const f = first?.[0] || "";
    const l = last?.[0] || "";
    return (f + l).toUpperCase();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar
        sx={{
          height: 70,
          display: "flex",
          justifyContent: "space-between",
          px: 3,
        }}
      >
        {/* LEFT SIDE: Branding */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1e40af",
              letterSpacing: "0.4px",
            }}
          >
            {tenantName}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "#6b7280", fontSize: "0.75rem" }}
          >
            Multi-tenant Hospital Management System
          </Typography>
        </Box>

        {/* RIGHT SIDE: User Profile */}
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={department}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              textTransform: "uppercase",
              borderRadius: "6px",
              letterSpacing: "0.6px",
            }}
          />

          {/* Profile avatar + dropdown */}
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={handleMenuClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 2,
                px: 1,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "primary.main",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {getInitials(firstName, lastName)}
              </Avatar>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  display: { xs: "none", sm: "block" },
                }}
              >
                {fullName}
              </Typography>

              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>

            {/* Profile Menu */}
            <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
              <MenuItem disabled>
                Signed in as <strong>&nbsp;{fullName}</strong>
              </MenuItem>

              <MenuItem onClick={handleMenuClose}>Profile Settings</MenuItem>

              <MenuItem onClick={handleMenuClose}>My Department</MenuItem>

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  dispatch(logout());
                }}
                sx={{ color: "red" }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
