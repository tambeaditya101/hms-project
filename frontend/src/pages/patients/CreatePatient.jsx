// src/pages/patients/CreatePatient.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Grid,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

export default function CreatePatient() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    type: "OPD",
    doctorId: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target?.name]: e.target?.value });

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const res = await api.get("/users", {
        params: { role: "DOCTOR" },
      });

      setDoctors(res?.data?.users ?? []); // safe fallback
    } catch (err) {
      console.error("Failed to load doctors", err);
      setDoctors([]); // avoid undefined
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/patients/create", form);
      navigate("/patients");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">
        Add New Patient
      </Typography>

      <Card className="shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* FIRST NAME */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={form?.firstName ?? ""}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* LAST NAME */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={form?.lastName ?? ""}
                  onChange={handleChange}
                />
              </Grid>

              {/* DOB */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  name="dob"
                  InputLabelProps={{ shrink: true }}
                  value={form?.dob ?? ""}
                  onChange={handleChange}
                />
              </Grid>

              {/* GENDER */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={form?.gender ?? ""}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              {/* BLOOD GROUP */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Blood Group"
                  name="bloodGroup"
                  value={form?.bloodGroup ?? ""}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (bg) => (
                      <MenuItem key={bg} value={bg}>
                        {bg}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>

              {/* TYPE */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Patient Type"
                  name="type"
                  value={form?.type ?? "OPD"}
                  onChange={handleChange}
                >
                  <MenuItem value="OPD">OPD</MenuItem>
                  <MenuItem value="IPD">IPD</MenuItem>
                </TextField>
              </Grid>

              {/* ASSIGN DOCTOR */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Assign Doctor"
                  name="doctorId"
                  value={form?.doctorId ?? ""}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">Select Doctor</MenuItem>

                  {(doctors ?? []).map((doc) => (
                    <MenuItem key={doc?.id} value={doc?.id}>
                      {`${doc?.firstName ?? ""} ${doc?.lastName ?? ""}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* CONTACT PHONE */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={form?.phone ?? ""}
                  onChange={handleChange}
                />
              </Grid>

              {/* EMAIL */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={form?.email ?? ""}
                  onChange={handleChange}
                />
              </Grid>

              {/* ADDRESS */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={form?.address ?? ""}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* EMERGENCY CONTACT */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  name="emergencyContact"
                  value={form?.emergencyContact ?? ""}
                  onChange={handleChange}
                />
              </Grid>

              {/* ERROR BOX */}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {/* BUTTONS */}
              <Grid item xs={12} className="mt-4 flex gap-4">
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  className="!bg-blue-600 hover:!bg-blue-700"
                >
                  {loading ? (
                    <CircularProgress size={22} className="text-white" />
                  ) : (
                    "Create Patient"
                  )}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/patients")}
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
