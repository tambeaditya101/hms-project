// src/pages/appointments/AppointmentsList.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  MenuItem,
  Chip,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { hasRole } from "../../utils/permissions";
import { formatDate } from "../../utils/formatDate";
import { formatTime } from "../../utils/formatTime";

export default function AppointmentsList() {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.auth?.user);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    doctorId: "",
    date: "",
  });

  const { search, status, doctorId, date } = filters;

  // Stats
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });

  // Permissions
  const canCreate = hasRole(user, ["ADMIN", "RECEPTIONIST"]);

  // Load Doctors
  const fetchDoctors = async () => {
    try {
      const res = await api.get("/users", { params: { role: "DOCTOR" } });
      setDoctors(res?.data?.users ?? []);
    } catch (err) {
      console.error("Failed to load doctors", err);
      setDoctors([]);
    }
  };

  // Load Appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/appointments", {
        params: {
          search,
          status: status || undefined,
          doctorId: doctorId || undefined,
          date: date || undefined,
        },
      });

      const list = res?.data?.appointments ?? [];
      setAppointments(list);
      console.log(list, "adii");

      computeStats(list);
    } catch (err) {
      console.error("Failed to load appointments", err);
      setAppointments([]);
      setStats({
        today: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Compute Stats
  const computeStats = (list) => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const today = list.filter((a) => {
      if (!a?.date) return false;
      const d = new Date(a.date);
      return (
        d.toISOString().slice(0, 10) === todayStr && a?.status === "SCHEDULED"
      );
    }).length;

    const upcoming = list.filter((a) => {
      if (!a?.date) return false;
      return new Date(a.date) > now && a?.status === "SCHEDULED";
    }).length;

    const completed = list.filter((a) => a?.status === "COMPLETED").length;
    const cancelled = list.filter((a) => a?.status === "CANCELLED").length;

    setStats({ today, upcoming, completed, cancelled });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [search, status, doctorId, date]);

  // Memoized Columns
  const columns = useMemo(
    () => [
      {
        field: "patient",
        headerName: "Patient",
        flex: 1,
        valueGetter: (p) => {
          if (!p) return "—";
          return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
        },
      },
      {
        field: "doctor",
        headerName: "Doctor",
        flex: 1,
        valueGetter: (p) => {
          if (!p) return "—";
          return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
        },
      },
      {
        field: "date",
        headerName: "Date",
        width: 150,
        valueGetter: (p) => formatDate(p),
      },
      {
        field: "time",
        headerName: "Time",
        width: 120,
        valueGetter: (p) => formatTime(p) ?? "—",
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        renderCell: (p) => (
          <Chip
            label={p?.row?.status ?? "UNKNOWN"}
            color={
              p?.row?.status === "COMPLETED"
                ? "success"
                : p?.row?.status === "CANCELLED"
                ? "error"
                : "warning"
            }
          />
        ),
      },
      {
        field: "reason",
        headerName: "Reason",
        flex: 1,
        valueGetter: (p) => p ?? "—",
      },
    ],
    []
  );

  return (
    <Box className="p-6">
      {/* TITLE */}
      <Typography variant="h4" className="font-bold mb-4">
        Appointments
      </Typography>

      {/* STATS */}
      <Grid container spacing={3} className="mb-6">
        {[
          { label: "Today's", value: stats.today, color: "#4f46e5" },
          { label: "Upcoming", value: stats.upcoming, color: "#0ea5e9" },
          { label: "Completed", value: stats.completed, color: "#10b981" },
          { label: "Cancelled", value: stats.cancelled, color: "#ef4444" },
        ].map((s, i) => (
          <Grid key={i} size={{ xs: 12, md: 3 }}>
            <Card
              className="shadow-md"
              style={{ background: s.color, color: "white" }}
            >
              <CardContent>
                <Typography variant="h6">{s.label}</Typography>
                <Typography variant="h3" className="font-bold">
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FILTERS + CREATE BUTTON */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        {/* FILTERS */}
        <Box className="flex flex-wrap gap-3 items-center">
          <TextField
            size="small"
            label="Search patient..."
            value={search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />

          <TextField
            size="small"
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
          />

          <TextField
            size="small"
            select
            label="Status"
            value={status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            style={{ minWidth: 130 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>

          <TextField
            size="small"
            select
            label="Doctor"
            value={doctorId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, doctorId: e.target.value }))
            }
            style={{ minWidth: 160 }}
          >
            <MenuItem value="">All Doctors</MenuItem>
            {doctors.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {`${d.firstName} ${d.lastName}`}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* CREATE BUTTON */}
        {canCreate && (
          <Button
            variant="contained"
            className="!bg-blue-600 hover:!bg-blue-700"
            onClick={() => navigate("/appointments/create")}
          >
            + Book Appointment
          </Button>
        )}
      </Box>

      {/* TABLE */}
      <Card className="shadow-lg">
        <CardContent>
          {loading ? (
            <Box className="flex justify-center p-6">
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={appointments}
              columns={columns}
              autoHeight
              pageSizeOptions={[5, 10, 20, 50, 100]} // ✔ prevents warning
              disableRowSelectionOnClick
              getRowId={(row) => row?.id ?? `appt-${Math.random()}`} // ✔ safe fallback
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
