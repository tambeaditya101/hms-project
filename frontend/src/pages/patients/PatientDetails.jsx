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

  // Fetch everything
  const fetchData = async () => {
    try {
      // Patient list fetch
      const res = await api.get(`/patients`, { params: { id } });
      const list = res?.data?.patients ?? [];

      const pat = list?.find?.((p) => p?.id === id) ?? null;
      setPatient(pat);

      // Appointments
      const apRes = await api.get(`/appointments`, {
        params: { patientId: id },
      });
      setAppointments(apRes?.data?.appointments ?? []);

      // Prescriptions
      const prRes = await api.get(`/prescriptions/patient/${id}`);
      setPrescriptions(prRes?.data?.prescriptions ?? []);

      // Bills
      const billRes = await api.get(`/billing/patient/${id}`);
      setBills(billRes?.data?.bills ?? []);
    } catch (err) {
      console.error("Error loading patient details:", err);
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
      <Box className="flex justify-center p-10">
        <CircularProgress />
      </Box>
    );

  if (error || !patient)
    return (
      <Box className="p-6">
        <Alert severity="error">{error || "Patient not found"}</Alert>
      </Box>
    );

  // DataGrid columns (Safe)
  const appointmentCols = [
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
      field: "doctor",
      headerName: "Doctor",
      flex: 1,
      valueGetter: (p) =>
        `${p?.row?.doctor?.firstName ?? ""} ${p?.row?.doctor?.lastName ?? ""}`,
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
  ];

  const prescriptionCols = [
    {
      field: "prescriptionUid",
      headerName: "Rx UID",
      width: 180,
      valueGetter: (p) => p?.row?.prescriptionUid ?? "—",
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      valueGetter: (p) => p?.row?.notes ?? "—",
    },
    {
      field: "doctor",
      headerName: "Doctor",
      flex: 1,
      valueGetter: (p) =>
        `${p?.row?.doctor?.firstName ?? ""} ${p?.row?.doctor?.lastName ?? ""}`,
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 150,
      valueGetter: (p) =>
        p?.row?.createdAt
          ? new Date(p.row.createdAt).toLocaleDateString()
          : "—",
    },
  ];

  const billCols = [
    {
      field: "id",
      headerName: "Bill ID",
      width: 180,
      valueGetter: (p) => p?.row?.id ?? "—",
    },
    {
      field: "totalAmount",
      headerName: "Total",
      width: 130,
      valueGetter: (p) => p?.row?.totalAmount ?? 0,
    },
    {
      field: "paidAmount",
      headerName: "Paid",
      width: 130,
      valueGetter: (p) => p?.row?.paidAmount ?? 0,
    },
    {
      field: "dueAmount",
      headerName: "Due",
      width: 130,
      valueGetter: (p) => p?.row?.dueAmount ?? 0,
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (p) => (
        <Chip
          label={p?.row?.status ?? "—"}
          color={
            p?.row?.status === "PAID"
              ? "success"
              : p?.row?.status === "PARTIAL"
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
      <Typography variant="h4" className="font-bold mb-2">
        Patient Profile
      </Typography>

      {/* Profile Card */}
      <Card className="shadow-lg mb-6">
        <CardContent>
          <Grid container spacing={3}>
            {/* LEFT */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" className="font-bold">
                {patient?.firstName ?? ""} {patient?.lastName ?? ""}
              </Typography>

              <p className="text-gray-600">{patient?.patientUid ?? "—"}</p>

              <Chip
                label={patient?.type ?? "—"}
                color={patient?.type === "OPD" ? "primary" : "secondary"}
                className="mt-2"
              />
            </Grid>

            {/* MID */}
            <Grid item xs={12} md={4}>
              <p>
                <strong>Phone:</strong> {patient?.phone ?? "—"}
              </p>
              <p>
                <strong>Email:</strong> {patient?.email ?? "—"}
              </p>
              <p>
                <strong>Gender:</strong> {patient?.gender ?? "—"}
              </p>
            </Grid>

            {/* RIGHT */}
            <Grid item xs={12} md={4}>
              <p>
                <strong>Doctor:</strong>{" "}
                {patient?.doctor
                  ? `${patient?.doctor?.firstName ?? ""} ${
                      patient?.doctor?.lastName ?? ""
                    }`
                  : "—"}
              </p>
              <p>
                <strong>Blood Group:</strong> {patient?.bloodGroup ?? "—"}
              </p>
              <p>
                <strong>Address:</strong> {patient?.address ?? "—"}
              </p>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{ marginBottom: "20px" }}
      >
        <Tab label="Appointments" />
        <Tab label="Prescriptions" />
        <Tab label="Bills" />
      </Tabs>

      {/* Appointments */}
      {tab === 0 && (
        <Card className="shadow-lg">
          <CardContent>
            <Typography variant="h6" className="mb-3 font-semibold">
              Appointment History
            </Typography>

            <DataGrid
              rows={appointments ?? []}
              columns={appointmentCols}
              autoHeight
              getRowId={(row) => row?.id ?? Math.random()}
              disableRowSelectionOnClick
            />
          </CardContent>
        </Card>
      )}

      {/* Prescriptions */}
      {tab === 1 && (
        <Card className="shadow-lg">
          <CardContent>
            <Typography variant="h6" className="mb-3 font-semibold">
              Prescriptions
            </Typography>

            <DataGrid
              rows={prescriptions ?? []}
              columns={prescriptionCols}
              autoHeight
              getRowId={(row) => row?.id ?? Math.random()}
              disableRowSelectionOnClick
            />
          </CardContent>
        </Card>
      )}

      {/* Bills */}
      {tab === 2 && (
        <Card className="shadow-lg">
          <CardContent>
            <Typography variant="h6" className="mb-3 font-semibold">
              Billing History
            </Typography>

            <DataGrid
              rows={bills ?? []}
              columns={billCols}
              autoHeight
              getRowId={(row) => row?.id ?? Math.random()}
              disableRowSelectionOnClick
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
