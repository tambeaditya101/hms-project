/* src/pages/users/UsersList.jsx */
import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../utils/axios";

export default function UsersList() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    department: "",
  });

  const ROLES = [
    "ADMIN",
    "DOCTOR",
    "NURSE",
    "RECEPTIONIST",
    "CHEMIST",
    "ACCOUNTANT",
  ];
  const DEPARTMENTS = [
    "ADMINISTRATION",
    "CARDIOLOGY",
    "PEDIATRICS",
    "ORTHOPEDICS",
    "GENERAL",
    "NURSING",
  ];

  const ROLE_COLORS = {
    ADMIN: "primary",
    DOCTOR: "success",
    NURSE: "secondary",
    RECEPTIONIST: "warning",
    CHEMIST: "info",
    ACCOUNTANT: "default",
  };

  const STATUS_COLORS = {
    ACTIVE: "success",
    INACTIVE: "warning",
    LOCKED: "error",
  };

  /** Fetch Users */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data?.users ?? []);
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /** FILTERED LIST */
  const filteredUsers = useMemo(() => {
    let list = [...users];
    const q = filters.search.toLowerCase();

    if (filters.search) {
      list = list.filter((u) =>
        `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase().includes(q)
      );
    }

    if (filters.role) {
      list = list.filter((u) => u.roles?.includes(filters.role));
    }

    if (filters.department) {
      list = list.filter((u) => u.department === filters.department);
    }

    return list;
  }, [users, filters]);

  /** COLUMNS */
  const columns = [
    {
      field: "name",
      headerName: "Staff Member",
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        const f = params.row.firstName ?? "";
        const l = params.row.lastName ?? "";
        const initials = `${f[0] ?? ""}${l[0] ?? ""}`.toUpperCase();

        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar>{initials}</Avatar>
            <Typography>{`${f} ${l}`}</Typography>
          </Box>
        );
      },
    },
    {
      field: "roles",
      headerName: "Roles",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const roles = params.row.roles ?? [];
        if (roles.length === 0) return "—";

        return (
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {roles.map((role) => (
              <Chip
                key={role}
                label={role}
                color={ROLE_COLORS[role] ?? "default"}
                size="small"
                sx={{ fontSize: "0.7rem" }}
              />
            ))}
          </Box>
        );
      },
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row?.department ?? "—"}
          variant="outlined"
          color="info"
          size="small"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const status = params.row.status ?? "UNKNOWN";
        return (
          <Chip
            label={status}
            color={STATUS_COLORS[status] ?? "default"}
            size="small"
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      renderCell: (p) => (
        <Button
          variant="contained"
          size="small"
          className="!bg-blue-600 hover:!bg-blue-700"
          onClick={() => navigate(`/users/${p.row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box className="p-6 space-y-6">
      <Typography variant="h4" fontWeight="bold">
        Staff Management
      </Typography>

      {/* FILTERS CARD */}
      <Card className="shadow-lg">
        <CardContent>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* SEARCH */}
            <TextField
              fullWidth
              label="Search by name"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />

            {/* ROLE FILTER */}
            <TextField
              fullWidth
              select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              SelectProps={{
                displayEmpty: true,
                renderValue: (val) =>
                  val ? (
                    val
                  ) : (
                    <span className="text-gray-400">Filter by Role</span>
                  ),
              }}
            >
              <MenuItem value="">All</MenuItem>
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>

            {/* DEPARTMENT FILTER */}
            <TextField
              fullWidth
              select
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
              SelectProps={{
                displayEmpty: true,
                renderValue: (val) =>
                  val ? (
                    val
                  ) : (
                    <span className="text-gray-400">Filter by Department</span>
                  ),
              }}
            >
              <MenuItem value="">All</MenuItem>
              {DEPARTMENTS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* ADD USER BUTTON */}
          {user?.roles?.includes("ADMIN") && (
            <Box className="flex justify-end">
              <Button
                variant="contained"
                className="!bg-blue-600 hover:!bg-blue-700"
                onClick={() => navigate("/users/create")}
              >
                + Add Staff Member
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="shadow-lg">
        <CardContent>
          {loading ? (
            <Box className="flex justify-center p-6">
              <CircularProgress />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box className="text-center py-8 text-gray-500">
              <Typography>No staff members found.</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              autoHeight
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
