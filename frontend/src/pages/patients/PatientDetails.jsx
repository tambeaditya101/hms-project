// src/pages/patients/PatientDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../utils/axios";

export default function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [tab, setTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await api.get("/patients", { params: { id } });
      const list = res?.data?.patients ?? [];
      const pat = list.find((p) => p.id === id);

      setPatient(pat);

      const ap = await api.get("/appointments", { params: { patientId: id } });
      setAppointments(ap?.data?.appointments ?? []);

      const pr = await api.get(`/prescriptions/patient/${id}`);
      setPrescriptions(pr?.data?.prescriptions ?? []);

      const bl = await api.get(`/billing/patient/${id}`);
      setBills(bl?.data?.bills ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading)
    return (
      <Box className="flex justify-center min-h-[300px]">
        <CircularProgress />
      </Box>
    );

  if (error || !patient)
    return (
      <Box className="p-6">
        <Alert severity="error">{error || "Patient not found"}</Alert>
      </Box>
    );

  const appointmentCols = [
    { field: "date", headerName: "Date", width: 140 },
    { field: "time", headerName: "Time", width: 120 },
    {
      field: "doctor",
      headerName: "Doctor",
      flex: 1,
      valueGetter: (p) =>
        `${p.row?.doctor?.firstName ?? ""} ${p.row?.doctor?.lastName ?? ""}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (p) => (
        <Chip
          label={p.row.status}
          color={
            p.row.status === "COMPLETED"
              ? "success"
              : p.row.status === "CANCELLED"
              ? "error"
              : "warning"
          }
        />
      ),
    },
  ];

  const prescriptionCols = [
    { field: "prescriptionUid", headerName: "Rx ID", width: 150 },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      valueGetter: (p) => p.row?.notes ?? "—",
    },
    {
      field: "doctor",
      headerName: "Doctor",
      width: 200,
      valueGetter: (p) =>
        `${p.row?.doctor?.firstName ?? ""} ${p.row?.doctor?.lastName ?? ""}`,
    },
    { field: "createdAt", headerName: "Date", width: 150 },
  ];

  const billCols = [
    { field: "id", headerName: "Bill ID", width: 150 },
    { field: "totalAmount", headerName: "Total", width: 120 },
    { field: "paidAmount", headerName: "Paid", width: 120 },
    { field: "dueAmount", headerName: "Due", width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (p) => (
        <Chip
          label={p.row.status}
          color={
            p.row.status === "PAID"
              ? "success"
              : p.row.status === "PARTIAL"
              ? "warning"
              : "error"
          }
        />
      ),
    },
  ];

  return (
    <Box className="p-6">
      {/* HEADER */}
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Patient Profile
      </Typography>

      {/* PROFILE CARD */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            {patient.firstName?.[0]}
            {patient.lastName?.[0]}
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight="600">
              {patient.firstName} {patient.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {patient.patientUid}
            </Typography>

            <Chip
              label={patient.type}
              color={patient.type === "OPD" ? "primary" : "secondary"}
              sx={{ mt: 1 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* DETAILS SECTION */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={4}>
            {/* LEFT COLUMN */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Basic Information
              </Typography>
              <Detail label="Phone" value={patient.phone} />
              <Detail label="Email" value={patient.email} />
              <Detail label="Gender" value={patient.gender} />
              <Detail label="DOB" value={patient.dob || "—"} />
            </Grid>

            {/* RIGHT COLUMN */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Medical Information
              </Typography>
              <Detail
                label="Doctor"
                value={
                  patient.doctor
                    ? `${patient.doctor.firstName} ${patient.doctor.lastName}`
                    : "—"
                }
              />
              <Detail label="Blood Group" value={patient.bloodGroup} />
              <Detail label="Address" value={patient.address} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Appointments" />
        <Tab label="Prescriptions" />
        <Tab label="Bills" />
      </Tabs>

      {/* TAB CONTENT */}
      <Card className="shadow-lg">
        <CardContent>
          {tab === 0 && (
            <>
              <SectionTitle title="Appointment History" />
              <DataGrid
                rows={appointments}
                columns={appointmentCols}
                autoHeight
                getRowId={(r) => r.id}
              />
            </>
          )}

          {tab === 1 && (
            <>
              <SectionTitle title="Prescriptions" />
              <DataGrid
                rows={prescriptions}
                columns={prescriptionCols}
                autoHeight
                getRowId={(r) => r.id}
              />
            </>
          )}

          {tab === 2 && (
            <>
              <SectionTitle title="Bills" />
              <DataGrid
                rows={bills}
                columns={billCols}
                autoHeight
                getRowId={(r) => r.id}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

/* Reusable Detail Component */
function Detail({ label, value }) {
  return (
    <Box mb={1.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="500">
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

function SectionTitle({ title }) {
  return (
    <Typography variant="h6" className="mb-3 font-semibold">
      {title}
    </Typography>
  );
}
