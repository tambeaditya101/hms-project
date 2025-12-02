// src/pages/appointments/AppointmentsList.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Grid,
  MenuItem,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

export default function AppointmentsList() {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.auth?.user);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");

  const [doctors, setDoctors] = useState([]);

  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });

  const canCreate =
    user?.roles?.includes("HOSPITAL_ADMIN") ||
    user?.roles?.includes("RECEPTIONIST");

  // Load doctors for filter dropdown
  const fetchDoctors = async () => {
    try {
      const res = await api.get("/users", { params: { role: "DOCTOR" } });
      setDoctors(res?.data?.users ?? []);
    } catch (err) {
      console.error("Failed to load doctors", err);
      setDoctors([]);
    }
  };

  // Load appointments
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

      // compute stats
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);

      const today = list.filter((a) => {
        const d = a?.date ? new Date(a.date) : null;
        return (
          d &&
          d.toISOString().slice(0, 10) === todayStr &&
          a?.status === "SCHEDULED"
        );
      }).length;

      const upcoming = list.filter((a) => {
        const d = a?.date ? new Date(a.date) : null;
        return d && d > now && a?.status === "SCHEDULED";
      }).length;

      const completed = list.filter((a) => a?.status === "COMPLETED").length;
      const cancelled = list.filter((a) => a?.status === "CANCELLED").length;

      setStats({
        today,
        upcoming,
        completed,
        cancelled,
      });
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

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, [search, status, doctorId, date]);

  const columns = [
    {
      field: "patient",
      headerName: "Patient",
      flex: 1,
      valueGetter: (p) =>
        `${p?.row?.patient?.firstName ?? ""} ${
          p?.row?.patient?.lastName ?? ""
        }`.trim() || "—",
    },
    {
      field: "doctor",
      headerName: "Doctor",
      flex: 1,
      valueGetter: (p) =>
        `${p?.row?.doctor?.firstName ?? ""} ${
          p?.row?.doctor?.lastName ?? ""
        }`.trim() || "—",
    },
    {
      field: "date",
      headerName: "Date",
      width: 150,
      valueGetter: (p) =>
        p?.row?.date ? new Date(p.row.date).toLocaleDateString() : "—",
    },
    {
      field: "time",
      headerName: "Time",
      width: 120,
      valueGetter: (p) => p?.row?.time ?? "—",
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
      valueGetter: (p) => p?.row?.reason ?? "—",
    },
  ];

  return (
    <Box className="p-6">
      {/* Title */}
      <Typography variant="h4" className="font-bold mb-4">
        Appointments
      </Typography>

      {/* STATS CARDS */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={3}>
          <Card
            className="shadow-md"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Typography variant="h6">Today&apos;s</Typography>
              <Typography variant="h3" className="font-bold">
                {stats?.today ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            className="shadow-md"
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Typography variant="h6">Upcoming</Typography>
              <Typography variant="h3" className="font-bold">
                {stats?.upcoming ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            className="shadow-md"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Typography variant="h6">Completed</Typography>
              <Typography variant="h3" className="font-bold">
                {stats?.completed ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            className="shadow-md"
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #f97373 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Typography variant="h6">Cancelled</Typography>
              <Typography variant="h3" className="font-bold">
                {stats?.cancelled ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTERS + CREATE */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        {/* Left filters */}
        <Box className="flex flex-wrap gap-3 items-center">
          <TextField
            size="small"
            label="Search patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <TextField
            size="small"
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <TextField
            size="small"
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
            onChange={(e) => setDoctorId(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <MenuItem value="">All Doctors</MenuItem>
            {(doctors ?? []).map((doc) => (
              <MenuItem key={doc?.id} value={doc?.id}>
                {`${doc?.firstName ?? ""} ${doc?.lastName ?? ""}`}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Right button */}
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
              rows={appointments ?? []}
              columns={columns}
              autoHeight
              pageSizeOptions={[5, 10, 20]}
              disableRowSelectionOnClick
              getRowId={(row) => row?.id ?? Math.random()}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
