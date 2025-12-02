// src/pages/patients/PatientsList.jsx
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function PatientsList() {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.auth?.user);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    opd: 0,
    ipd: 0,
  });

  // Fetch patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/patients", {
        params: { search },
      });

      const list = res?.data?.patients || [];

      setPatients(list);

      // compute safe stats
      setStats({
        total: list?.length || 0,
        opd: list?.filter((p) => p?.type === "OPD")?.length || 0,
        ipd: list?.filter((p) => p?.type === "IPD")?.length || 0,
      });
    } catch (err) {
      console.error("Fetch patients error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line
  }, [search]);

  // Columns
  const columns = [
    {
      field: "name",
      headerName: "Patient Name",
      flex: 1,
      valueGetter: (params) =>
        `${params?.row?.firstName || ""} ${params?.row?.lastName || ""}`.trim(),
    },
    { field: "patientUid", headerName: "Patient UID", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "type", headerName: "Type", width: 120 },
    {
      field: "doctorName",
      headerName: "Doctor",
      flex: 1,
      valueGetter: (params) =>
        params?.row?.doctor
          ? `${params?.row?.doctor?.firstName || ""} ${
              params?.row?.doctor?.lastName || ""
            }`.trim()
          : "—",
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      valueGetter: (params) =>
        params?.row?.createdAt
          ? new Date(params?.row?.createdAt).toLocaleDateString()
          : "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            if (params?.row?.id) navigate(`/patients/${params?.row?.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box className="p-6">
      {/* PAGE TITLE */}
      <Typography variant="h4" className="font-bold mb-4">
        Patients Overview
      </Typography>

      {/* STATS CARDS */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={4}>
          <Card
            className="shadow-md"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Typography variant="h6">Total Patients</Typography>
              <Typography variant="h3" className="font-bold">
                {stats?.total ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            className="shadow-md"
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Typography variant="h6">OPD Patients</Typography>
              <Typography variant="h3" className="font-bold">
                {stats?.opd ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            className="shadow-md"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Typography variant="h6">IPD Patients</Typography>
              <Typography variant="h3" className="font-bold">
                {stats?.ipd ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SEARCH + ADD BUTTON */}
      <Box className="flex items-center justify-between mb-4">
        <TextField
          label="Search Patients..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3"
        />

        {(user?.roles?.includes("ADMIN") ||
          user?.roles?.includes("DOCTOR")) && (
          <Button
            variant="contained"
            onClick={() => navigate("/patients/create")}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            + Add Patient
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
              rows={patients ?? []}
              columns={columns}
              autoHeight
              pageSizeOptions={[5, 10, 20]}
              disableRowSelectionOnClick
              getRowId={(row) => row?.id || Math.random()} // safe fallback
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
