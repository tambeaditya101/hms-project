// src/pages/appointments/CreateAppointment.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

export default function CreateAppointment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    reason: "",
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target?.name]: e.target?.value });

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res?.data?.patients ?? []);
    } catch (err) {
      console.error("Failed to load patients", err);
      setPatients([]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/users/doctors");
      setDoctors(res?.data?.doctors);
    } catch (err) {
      console.error("Failed to load doctors", err);
      setDoctors([]);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/appointments/create", form);
      navigate("/appointments");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create appointment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">
        Book Appointment
      </Typography>

      <Card className="shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* PATIENT */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Patient"
                  name="patientId"
                  value={form?.patientId ?? ""}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">Select Patient</MenuItem>
                  {(patients ?? []).map((p) => (
                    <MenuItem key={p?.id} value={p?.id}>
                      {`${p?.firstName ?? ""} ${p?.lastName ?? ""} (${
                        p?.patientUid ?? ""
                      })`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* DOCTOR */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Doctor"
                  name="doctorId"
                  value={form?.doctorId ?? ""}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">Select Doctor</MenuItem>
                  {(doctors ?? []).map((d) => (
                    <MenuItem key={d?.id} value={d?.id}>
                      {`${d?.firstName ?? ""} ${d?.lastName ?? ""}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* DATE */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  name="date"
                  InputLabelProps={{ shrink: true }}
                  value={form?.date ?? ""}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* TIME */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Time (e.g. 10:00 AM)"
                  name="time"
                  value={form?.time ?? ""}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* REASON */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason / Notes"
                  name="reason"
                  value={form?.reason ?? ""}
                  onChange={handleChange}
                />
              </Grid>

              {/* ERROR */}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {/* BUTTONS */}
              <Grid item xs={12} className="mt-4 flex gap-4">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  className="!bg-blue-600 hover:!bg-blue-700"
                >
                  {loading ? (
                    <CircularProgress size={22} className="text-white" />
                  ) : (
                    "Create Appointment"
                  )}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/appointments")}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
