import React, { useEffect } from 'react';
import { Container, Grid, Card, CardContent, Button, Typography, Alert, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GavelIcon from '@mui/icons-material/Gavel';

const AdminSupportPage: React.FC = () => {
  const { showNotification } = useNotification();

  useEffect(() => {
    showNotification(
      'This page is a UI placeholder for managing customer support requests and payment disputes. Full functionality requires backend API implementation.',
      'info',
      7000
    );
  }, [showNotification]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>Support Center</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SupportAgentIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5">Customer Requests</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                View and manage customer inquiries regarding account issues, event information, and general questions.
              </Typography>
              <Button variant="contained" disabled>View All Requests (Backend Needed)</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GavelIcon fontSize="large" color="warning" sx={{ mr: 1 }} />
                <Typography variant="h5">Payment Disputes</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Review and resolve payment disputes, chargebacks, and refund requests escalated to admin level.
              </Typography>
              <Button variant="contained" color="warning" disabled>Review Disputes (Backend Needed)</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button component={RouterLink} to="/admin/dashboard" variant="outlined">Back to Dashboard</Button>
      </Box>
    </Container>
  );
};

export default AdminSupportPage;
