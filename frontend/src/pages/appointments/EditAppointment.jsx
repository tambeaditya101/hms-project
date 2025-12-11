// src/pages/appointments/EditAppointment.jsx
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
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { TIME_SLOTS } from "../../constants/timeSlots";
import { useSelector } from "react-redux";
import { hasRole } from "../../utils/permissions";

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const canEdit = hasRole(user, ["ADMIN", "RECEPTIONIST"]);

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    status: "SCHEDULED",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /** Load patients/doctors & appointment */
  const loadData = async () => {
    try {
      const [patientsRes, doctorsRes, apptRes] = await Promise.all([
        api.get("/patients"),
        api.get("/users/doctors"),
        api.get(`/appointments/${id}`),
      ]);

      setPatients(patientsRes?.data?.patients ?? []);
      setDoctors(doctorsRes?.data?.doctors ?? []);

      const appt = apptRes?.data?.appointment;
      if (!appt) throw new Error("Appointment not found");

      setForm({
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        date: appt.date?.slice(0, 10) ?? "",
        time: appt.time ?? "",
        reason: appt.reason ?? "",
        status: appt.status ?? "SCHEDULED",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  /** Submit update (full edit) */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Only send fields allowed for edit
      const payload = {
        patientId: form.patientId,
        doctorId: form.doctorId,
        date: form.date,
        time: form.time,
        reason: form.reason,
      };

      await api.put(`/appointments/${id}`, payload);
      navigate(`/appointments/${id}`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center p-6">
        <CircularProgress />
      </Box>
    );

  if (!canEdit)
    return (
      <Box className="p-6">
        <Alert severity="warning">
          You do not have permission to edit this appointment.
        </Alert>
      </Box>
    );

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">
        Edit Appointment
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
                  value={form.patientId}
                  onChange={handleChange}
                  required
                >
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {`${p.firstName} ${p.lastName} (${p.patientUid})`}
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
                  value={form.doctorId}
                  onChange={handleChange}
                  required
                >
                  {doctors.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {`${d.firstName} ${d.lastName}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* DATE */}
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  fullWidth
                  label="Date"
                  name="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* TIME */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Time Slot"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                >
                  {TIME_SLOTS.map((slot) => (
                    <MenuItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* REASON */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason"
                  name="reason"
                  value={form.reason}
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
                  disabled={saving}
                  className="!bg-blue-600 hover:!bg-blue-700"
                >
                  {saving ? (
                    <CircularProgress size={22} className="text-white" />
                  ) : (
                    "Update Appointment"
                  )}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate(`/appointments/${id}`)}
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
