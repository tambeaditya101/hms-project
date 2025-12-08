import { useState, useEffect } from "react";
import { Typography, Box, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import UserForm from "../../components/users/UserForm";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/users", { params: { id } });
        const user = res.data.users.find((u) => u.id === id);

        if (!user) return setError("User not found");

        setForm({ ...user });
      } catch {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put(`/users/${id}`, form);
      navigate(`/users/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-bold mb-6">
        Edit Staff Member
      </Typography>

      <UserForm
        form={form}
        setForm={setForm}
        error={error}
        loading={saving}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/users/${id}`)}
      />
    </Box>
  );
}
