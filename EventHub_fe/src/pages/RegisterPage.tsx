import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { register, loading, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    if (authError) {
      const errorData = getErrorMessage(new Error(authError), 'Đăng ký thất bại');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    }
  }, [authError, showNotification]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await register({ fullName, email, password, phone });
      showNotification('Registration successful! You are now logged in.', 'success');
      navigate('/');
    } catch (e) {
      // Handled by context
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Card component={motion.div} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} whileHover={{ scale: 1.02 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Register
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="Full Name"
              name="fullName"
              autoFocus
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (e.target.value) setFullNameError('');
              }}
              onBlur={() => {
                if (!fullName) setFullNameError('Full name is required.');
              }}
              error={!!fullNameError}
              helperText={fullNameError}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.target.value)) {
                  setEmailError('');
                }
              }}
              onBlur={() => {
                if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                  setEmailError('Please enter a valid email address.');
                }
              }}
              error={!!emailError}
              helperText={emailError}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length >= 8) {
                  setPasswordError('');
                }
              }}
              onBlur={() => {
                if (password.length < 8) {
                  setPasswordError('Password must be at least 8 characters long.');
                }
              }}
              error={!!passwordError}
              helperText={passwordError}
            />
            <TextField
              margin="normal"
              fullWidth
              name="phone"
              label="Phone Number (Optional)"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !!fullNameError || !!emailError || !!passwordError || !fullName || !email || !password}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RegisterPage;
