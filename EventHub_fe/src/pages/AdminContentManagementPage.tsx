import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Button, Typography, TextField, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const AdminContentManagementPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [termsAndConditions, setTermsAndConditions] = useState<string>('Default terms and conditions...');
  const [privacyPolicy, setPrivacyPolicy] = useState<string>('Default privacy policy...');
  const [aboutUs, setAboutUs] = useState<string>('Default about us content...');

  useEffect(() => {
    showNotification(
      'This page is a UI placeholder. Backend API implementation required for content storage.',
      'info',
      5000
    );
  }, [showNotification]);

  const handleSaveContent = (contentType: string) => {
    showNotification(`Saving ${contentType} (frontend only)!`, 'success');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>Content Management</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Terms and Conditions</Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={() => handleSaveContent('Terms')}>Save Terms</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Privacy Policy</Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={() => handleSaveContent('Privacy Policy')}>Save Policy</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>About Us</Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                value={aboutUs}
                onChange={(e) => setAboutUs(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={() => handleSaveContent('About Us')}>Save About Us</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, mb: 8 }}>
        <Button component={RouterLink} to="/admin/dashboard" variant="outlined">Back to Dashboard</Button>
      </Box>
    </Container>
  );
};

export default AdminContentManagementPage;
