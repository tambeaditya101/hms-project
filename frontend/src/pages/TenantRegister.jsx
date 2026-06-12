import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import api from '../utils/axios';

export default function TenantRegister() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    licenseNumber: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (form.adminPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.adminPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Strip confirmPassword before sending
      const { confirmPassword, ...payload } = form;

      const res = await api.post('/tenants/register', payload);

      // Auto-login: store token + user in Redux & localStorage
      dispatch(
        setCredentials({
          token: res.data.token,
          user: res.data.user,
        }),
      );

      // Go straight to dashboard
      navigate('/');
    } catch (err) {
      setError(
        err?.response?.data?.message ?? err?.message ?? 'Registration failed',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-4'>
      <Card
        elevation={10}
        className='
          w-full 
          max-w-5xl 
          rounded-3xl 
          overflow-hidden 
          border border-gray-200 
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
        '
      >
        <Box className='grid grid-cols-1 md:grid-cols-2'>
          {/* LEFT PANEL */}
          <Box
            className='
              bg-gradient-to-br from-blue-600 to-blue-700
              text-white 
              flex flex-col 
              justify-center 
              items-center 
              p-10 
              relative
            '
          >
            {/* Decorative gradient bubble */}
            <Box
              className="
                absolute inset-0 opacity-20 pointer-events-none
                bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] 
              "
            />

            <LocalHospitalIcon
              sx={{ fontSize: 75 }}
              className='drop-shadow-xl'
            />

            <Typography
              variant='h4'
              className='font-extrabold mt-5 text-center leading-snug drop-shadow-md'
            >
              Hospital Onboarding Portal
            </Typography>

            <Typography className='opacity-90 mt-4 text-center text-sm leading-relaxed max-w-xs'>
              Register your hospital on our multi-tenant HMS platform and get
              instant access to patient management, appointment flows, billing,
              and staff management tools.
            </Typography>
          </Box>

          {/* RIGHT FORM PANEL */}
          <CardContent className='p-10 bg-white'>
            <Typography
              variant='h5'
              className='font-bold text-center mb-6 text-gray-700'
            >
              Create Hospital Profile
            </Typography>

            <form onSubmit={handleRegister} className='space-y-5'>
              {/* ── Section 1: Hospital Information ── */}
              <Typography
                variant='subtitle1'
                className='font-semibold text-gray-600'
              >
                Hospital Information
              </Typography>

              <TextField
                fullWidth
                label='Official Hospital Name'
                name='name'
                value={form.name}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label='Full Address'
                name='address'
                value={form.address}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label='License Number'
                name='licenseNumber'
                value={form.licenseNumber}
                onChange={handleChange}
                required
              />

              <Divider className='!my-2' />

              {/* ── Section 2: Admin Account ── */}
              <Typography
                variant='subtitle1'
                className='font-semibold text-gray-600'
              >
                Admin Account
              </Typography>

              <TextField
                fullWidth
                label='Admin Email'
                name='contactEmail'
                type='email'
                value={form.contactEmail}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label='Admin Phone Number'
                name='contactPhone'
                value={form.contactPhone}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                label='Choose Password'
                name='adminPassword'
                type='password'
                value={form.adminPassword}
                onChange={handleChange}
                required
                helperText='Minimum 8 characters'
              />

              <TextField
                fullWidth
                label='Confirm Password'
                name='confirmPassword'
                type='password'
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />

              {error && (
                <Alert severity='error' className='mt-2'>
                  {error}
                </Alert>
              )}

              <Button
                type='submit'
                fullWidth
                variant='contained'
                disabled={loading}
                className='!bg-blue-600 hover:!bg-blue-700 py-2.5 rounded-lg text-base font-semibold'
              >
                {loading ? (
                  <CircularProgress size={24} className='text-white' />
                ) : (
                  'Register & Get Started'
                )}
              </Button>
            </form>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
}
