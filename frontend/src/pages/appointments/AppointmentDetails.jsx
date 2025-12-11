// src/pages/appointments/AppointmentDetails.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogActions,
  MenuItem,
  TextField,
  Snackbar,
} from "@mui/material";
import api from "../../utils/axios";
import { hasRole } from "../../utils/permissions";
import { formatDate } from "../../utils/formatDate";
import { formatTime } from "../../utils/formatTime";
import { useSelector } from "react-redux";

export default function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDelete, setOpenDelete] = useState(false);

  const [statusLoading, setStatusLoading] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments/${id}`);
      const appt = res.data?.appointment;
      if (!appt) throw new Error("Appointment not found");
      setAppointment(appt);
      setStatusValue(appt.status || "SCHEDULED");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load appointment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
    // eslint-disable-next-line
  }, [id]);

  const canDelete = hasRole(user, ["ADMIN", "RECEPTIONIST"]);
  const canEdit = hasRole(user, ["ADMIN", "RECEPTIONIST"]);
  const canUpdateStatus = hasRole(user, ["ADMIN", "RECEPTIONIST", "DOCTOR"]);

  const handleDelete = async () => {
    try {
      await api.delete(`/appointments/${id}`);
      setOpenDelete(false);
      navigate("/appointments");
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: err?.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };

  const handleStatusChange = async () => {
    setStatusLoading(true);
    try {
      const res = await api.put(`/appointments/${id}/status`, {
        status: statusValue,
      });
      setAppointment(res.data?.appointment ?? appointment);
      setAlert({ open: true, message: "Status updated", severity: "success" });
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: err?.response?.data?.message || "Status update failed",
        severity: "error",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center p-10">
        <CircularProgress />
      </Box>
    );

  if (error || !appointment)
    return (
      <Box className="p-6">
        <Alert severity="error">{error || "Not found"}</Alert>
      </Box>
    );

  return (
    <Box className="p-6 space-y-4">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h4" className="font-bold">
          Appointment Details
        </Typography>

        <Box display="flex" gap={2}>
          {canEdit && (
            <Button
              variant="contained"
              className="!bg-blue-600 hover:!bg-blue-700"
              onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
            >
              Edit Appointment
            </Button>
          )}
        </Box>
      </Box>

      <Card className="shadow-lg">
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Patient
          </Typography>
          <Typography>{`${appointment.patient.firstName} ${appointment.patient.lastName}`}</Typography>

          <Typography variant="h6" fontWeight={600} mt={3}>
            Doctor
          </Typography>
          <Typography>{`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</Typography>

          <Typography variant="h6" fontWeight={600} mt={3}>
            Date & Time
          </Typography>
          <Typography>{formatDate(appointment.date)}</Typography>
          <Typography>{formatTime(appointment.time)}</Typography>

          <Typography variant="h6" fontWeight={600} mt={3}>
            Status
          </Typography>
          <Chip
            label={appointment.status}
            color={
              appointment.status === "COMPLETED"
                ? "success"
                : appointment.status === "CANCELLED"
                ? "error"
                : "warning"
            }
          />

          <Typography variant="h6" fontWeight={600} mt={3}>
            Reason
          </Typography>
          <Typography>{appointment.reason || "—"}</Typography>

          {/* Status controls */}
          {canUpdateStatus && (
            <Box mt={3} display="flex" gap={2} alignItems="center">
              {/* Doctor-friendly quick complete */}
              {hasRole(user, ["DOCTOR"]) ? (
                <>
                  {appointment.status !== "COMPLETED" && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        setStatusValue("COMPLETED");
                        handleStatusChange();
                      }}
                      color="success"
                    >
                      Mark Completed
                    </Button>
                  )}
                </>
              ) : (
                // Admin / Receptionist see full select
                <>
                  <TextField
                    select
                    size="small"
                    label="Change status"
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                    style={{ minWidth: 180 }}
                  >
                    <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </TextField>

                  <Button
                    variant="contained"
                    onClick={handleStatusChange}
                    disabled={statusLoading}
                  >
                    {statusLoading ? (
                      <CircularProgress size={18} />
                    ) : (
                      "Update Status"
                    )}
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <Box mt={4} className="flex gap-3">
            <Button
              variant="outlined"
              onClick={() => navigate("/appointments")}
            >
              Back
            </Button>

            {["SCHEDULED"].includes(appointment.status) && canDelete && (
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenDelete(true)}
              >
                Delete Appointment
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>
          Are you sure you want to delete this appointment?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={() => setAlert((a) => ({ ...a, open: false }))}
      >
        <Alert
          severity={alert.severity}
          onClose={() => setAlert((a) => ({ ...a, open: false }))}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
