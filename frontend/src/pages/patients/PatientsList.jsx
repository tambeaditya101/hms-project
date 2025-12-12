// src/pages/patients/PatientsList.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Chip,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import { hasRole } from "../../utils/permissions";

export default function PatientsList() {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.auth?.user);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(""); // OPD / IPD

  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    opd: 0,
    ipd: 0,
  });

  /** Fetch Patients from backend */
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/patients", {
        params: { search, type },
      });

      const list = res?.data?.patients || [];
      setPatients(list);

      setStats({
        total: list.length,
        opd: list.filter((p) => p?.type === "OPD").length,
        ipd: list.filter((p) => p?.type === "IPD").length,
      });
    } catch (err) {
      console.error("Fetch patients error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(t);
  }, [search, type]);

  /** COLUMNS – Safe */
  const columns = [
    {
      field: "name",
      headerName: "Patient Name",
      flex: 1,
      renderCell: (params) => {
        if (!params?.row) return "—";
        const f = params.row.firstName || "";
        const l = params.row.lastName || "";
        return `${f} ${l}`.trim() || "—";
      },
    },
    {
      field: "patientUid",
      headerName: "Patient UID",
      flex: 1,
      valueGetter: (params) => params ?? "-",
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      valueGetter: (params) => params ?? "—",
    },
    {
      field: "type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => {
        const type = params?.row?.type ?? "—";
        return (
          <Chip
            label={type}
            color={type === "OPD" ? "primary" : "secondary"}
            size="small"
          />
        );
      },
    },
    {
      field: "doctor",
      headerName: "Doctor",
      flex: 1,
      valueGetter: (params) => {
        console.log(params);

        const f = params.firstName || "";
        const l = params.lastName || "";
        return `${f} ${l}`.trim() || "—";
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      valueGetter: (params) => {
        const raw = params;
        if (!raw) return "—";
        return formatDate(raw);
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          className="!bg-blue-600 hover:!bg-blue-700"
          onClick={() =>
            params?.row?.id && navigate(`/patients/${params.row.id}`)
          }
        >
          View
        </Button>
      ),
    },
  ];

  // const canCreate = () => {
  //   const allowed = ["ADMIN", "DOCTOR", "RECEPTIONIST"];
  //   return allowed.some((r) => user?.roles?.includes(r));
  // };

  const canCreate = hasRole(user, ["ADMIN", "DOCTOR", "RECEPTIONIST"]);

  return (
    <Box className="p-6">
      {/* TITLE */}
      <Typography variant="h4" className="font-bold mb-4">
        Patients Overview
      </Typography>

      {/* COLORFUL STATS (YOUR ORIGINAL STYLE) */}
      <Grid container spacing={3} className="mb-6">
        <Grid size={{ xs: 12, md: 4 }}>
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
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
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
                {stats.opd}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
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
                {stats.ipd}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SEARCH + ADD BUTTON */}
      <Box className="flex items-center justify-between mb-4">
        <TextField
          label="Search Patients/Patient UID..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3"
        />
        <TextField
          label="Type"
          select
          value={type}
          onChange={(e) => setType(e.target.value)}
          sx={{ width: 180 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="OPD">OPD</MenuItem>
          <MenuItem value="IPD">IPD</MenuItem>
        </TextField>

        {canCreate && (
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
              rows={patients}
              columns={columns}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 20, 50, 100]}
              getRowId={(row) => row.id || `row-${Math.random()}`}
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
