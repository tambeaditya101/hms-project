import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/users/UserForm';
import api from '../../utils/axios';

export default function CreateUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    status: 'ACTIVE',
    roles: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdUser, setCreatedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/users/create', form);
      setCreatedUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className='p-6'>
      <Typography variant='h4' className='font-bold mb-6'>
        Add New Staff Member
      </Typography>

      <UserForm
        form={form}
        setForm={setForm}
        error={error}
        loading={loading}
        submitLabel='Create User'
        onSubmit={handleSubmit}
        onCancel={() => navigate('/users')}
      />

      {/* SUCCESS MODAL */}
      <Dialog open={!!createdUser} onClose={() => navigate('/users')}>
        <DialogTitle>User Created Successfully</DialogTitle>
        <Alert severity='warning' className='mb-4 font-medium'>
          ⚠️ Please save these credentials securely. This is the{' '}
          <strong>only time</strong> they will be shown.
        </Alert>
        <DialogContent>
          <Typography>
            <strong>Email:</strong> {createdUser?.email}
          </Typography>
          <Typography>
            <strong>Temporary Password:</strong> {createdUser?.tempPassword}
          </Typography>
          <Box className='mt-4 flex justify-end'>
            <Button variant='contained' onClick={() => navigate('/users')}>
              Done
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
