import React from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'; // Use outlined icons for consistency
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">User not logged in.</Typography>
        <Typography variant="body1">Please log in to view your profile.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center" sx={{ mb: 4 }}>
        User Profile
      </Typography>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <PersonOutlineIcon sx={{ fontSize: 80, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {user.fullName || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {user.id}
            </Typography>
          </Box>

          <List disablePadding>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <EmailOutlinedIcon color="action" />
              </ListItemIcon>
              <ListItemText primary="Email Address" secondary={user.email || 'N/A'} />
            </ListItem>
            {user.phone && (
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <PhoneAndroidOutlinedIcon color="action" />
                </ListItemIcon>
                <ListItemText primary="Phone Number" secondary={user.phone} />
              </ListItem>
            )}
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <AdminPanelSettingsOutlinedIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Roles" 
                secondary={
                  user.roles && user.roles.length > 0 
                  ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {user.roles.map((role, index) => (
                        <Chip 
                          key={index} 
                          label={role.replace('ROLE_', '')} // Display without ROLE_ prefix
                          color={role === 'ROLE_ADMIN' ? 'error' : role === 'ROLE_ORGANIZER' ? 'primary' : role === 'ROLE_STAFF' ? 'info' : 'default'} 
                          size="small" 
                        />
                      ))}
                    </Box>
                  ) 
                  : 'No roles assigned'
                } 
              />
            </ListItem>
            {/* Add more profile details if available in the JwtResponse */}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;