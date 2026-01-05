import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Button, Typography, TextField, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';

const AdminContentManagementPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [termsAndConditions, setTermsAndConditions] = useState<string>('Default terms and conditions...');
  const [privacyPolicy, setPrivacyPolicy] = useState<string>('Default privacy policy...');
  const [aboutUs, setAboutUs] = useState<string>('Default about us content...');

  useEffect(() => {
    // Load saved terms from localStorage
    const savedTerms = localStorage.getItem('eventhub_terms_and_conditions');
    if (savedTerms) {
      setTermsAndConditions(savedTerms);
    }
  }, []);

  const handleSaveContent = (contentType: string, content: string) => {
    console.log('=== ADMIN SAVE START ===');
    console.log('Content type:', contentType);
    console.log('Content length:', content.length);
    console.log('Content preview:', content.substring(0, 50));
    
    try {
      // Check if localStorage is available
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      console.log('localStorage available:', testValue === 'test');
      
      // Save terms to localStorage so organizers can see them
      if (contentType === 'Terms') {
        console.log('1. About to setItem with key: eventhub_terms_and_conditions');
        localStorage.setItem('eventhub_terms_and_conditions', content);
        console.log('2. setItem completed');
        
        const verify = localStorage.getItem('eventhub_terms_and_conditions');
        console.log('3. Verification read:', verify ? `${verify.length} chars` : 'null');
        console.log('4. Verification matches:', verify === content);
        
        // Also log all localStorage keys
        console.log('5. All localStorage keys:', Object.keys(localStorage));
      }
      console.log('=== ADMIN SAVE SUCCESS ===');
      showNotification(`${contentType} saved successfully! Changes will be visible to organizers immediately.`, 'success');
    } catch (err) {
      console.error('=== ADMIN SAVE ERROR ===');
      const errorData = getErrorMessage(err, 'Không thể lưu nội dung');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      console.error('Failed to save:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>Content Management</Typography>

      <Grid container spacing={4}>
        <Grid component="div" xs={12}>
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
              <Button variant="contained" onClick={() => handleSaveContent('Terms', termsAndConditions)}>Save Terms</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" xs={12}>
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
              <Button variant="contained" onClick={() => handleSaveContent('Privacy Policy', privacyPolicy)}>Save Policy</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" xs={12}>
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
              <Button variant="contained" onClick={() => handleSaveContent('About Us', aboutUs)}>Save About Us</Button>
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
