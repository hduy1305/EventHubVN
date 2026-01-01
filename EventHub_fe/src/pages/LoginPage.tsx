import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    if (authError) {
      showNotification(authError, 'danger');
    }
  }, [authError, showNotification]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('LoginPage: handleSubmit called, attempting login...');
    try {
      await login({ email, password });
      navigate('/');
    } catch (e) {
      // Handled by AuthContext
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Card component={motion.div} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} whileHover={{ scale: 1.02 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          {authError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {authError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
