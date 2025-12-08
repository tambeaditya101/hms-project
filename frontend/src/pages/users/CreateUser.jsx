import { useState } from "react";
import {
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import UserForm from "../../components/users/UserForm";

export default function CreateUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    status: "ACTIVE",
    roles: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/users/create", form);
      setCreatedUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">
        Add New Staff Member
      </Typography>

      <UserForm
        form={form}
        setForm={setForm}
        error={error}
        loading={loading}
        submitLabel="Create User"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/users")}
      />

      {/* SUCCESS MODAL */}
      <Dialog open={!!createdUser} onClose={() => navigate("/users")}>
        <DialogTitle>User Created Successfully</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>Username:</strong> {createdUser?.username}
          </Typography>
          <Typography>
            <strong>Temporary Password:</strong> {createdUser?.tempPassword}
          </Typography>
          <Box className="mt-4 flex justify-end">
            <Button variant="contained" onClick={() => navigate("/users")}>
              Done
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
