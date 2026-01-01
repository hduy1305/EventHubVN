import { AppBar, Toolbar, Typography, Button, Container, Box, Menu, MenuItem, IconButton, Badge, Link as MuiLink, Avatar, Grid } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState, useEffect } from 'react';

interface LayoutProps {
    children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // console.log('Layout - isAuthenticated:', isAuthenticated); // Removed debug log
    // console.log('Layout - User roles:', user?.roles); // Removed debug log
  }, [isAuthenticated, user]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const userRoles = user?.roles || [];

  const hasOrganizerRole = isAuthenticated && userRoles.includes('ROLE_ORGANIZER');
  const hasAdminRole = isAuthenticated && userRoles.includes('ROLE_ADMIN');
  const hasStaffRole = isAuthenticated && userRoles.includes('ROLE_STAFF');

  const hasStaffAccess = hasStaffRole || hasOrganizerRole || hasAdminRole;

  useEffect(() => {
    // These logs are for debugging. Keep them for now.
    console.log('Layout Render Debug: isAuthenticated', user);
    console.log('Layout Render Debug: userRoles', userRoles);
    console.log('Layout Render Debug: hasOrganizerRole', hasOrganizerRole);
    console.log('Layout Render Debug: hasAdminRole', hasAdminRole);
    console.log('Layout Render Debug: hasStaffRole', hasStaffRole);
    console.log('Layout Render Debug: hasStaffAccess', hasStaffAccess);
  }, [isAuthenticated, userRoles, hasOrganizerRole, hasAdminRole, hasStaffRole, hasStaffAccess]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: 70 }}>
            {/* Brand Logo */}
            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: 4 }}>
              <ConfirmationNumberOutlinedIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                }}
              >
                EventHub
              </Typography>
            </Box>

            {/* Navigation Links (Desktop) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexGrow: 1 }}>
              <Button 
                component={RouterLink} 
                to="/events" 
                color={isActive('/events') ? 'primary' : 'inherit'}
                sx={{ fontWeight: isActive('/events') ? 600 : 500 }}
              >
                Browse Events
              </Button>
              
              {isAuthenticated && (
                <>
                  <Button 
                    component={RouterLink} 
                    to="/my-tickets"
                    color={isActive('/my-tickets') ? 'primary' : 'inherit'}
                    sx={{ fontWeight: isActive('/my-tickets') ? 600 : 500 }}
                  >
                    My Tickets
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to="/pass-tickets"
                    color={isActive('/pass-tickets') ? 'primary' : 'inherit'}
                    sx={{ fontWeight: isActive('/pass-tickets') ? 600 : 500 }}
                  >
                    Tickets being passed
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to="/my-orders"
                    color={isActive('/my-orders') ? 'primary' : 'inherit'}
                    sx={{ fontWeight: isActive('/my-orders') ? 600 : 500 }}
                  >
                    Order History
                  </Button>
                </>
              )}

              {hasOrganizerRole && (
                 <Button 
                   component={RouterLink} 
                   to="/organizer/dashboard" 
                   color={isActive('/organizer/dashboard') ? 'primary' : 'inherit'}
                   sx={{ fontWeight: isActive('/organizer/dashboard') ? 600 : 500 }}
                 >
                   Organizer
                 </Button>
              )}
              
              {hasAdminRole && (
                 <Button 
                   component={RouterLink} 
                   to="/admin/dashboard" 
                   color={isActive('/admin/dashboard') ? 'primary' : 'inherit'}
                   sx={{ fontWeight: isActive('/admin/dashboard') ? 600 : 500 }}
                 >
                   Admin
                 </Button>
              )}

              {hasStaffAccess && (
                 <Button 
                   component={RouterLink} 
                   to="/staff/checkin" 
                   color={isActive('/staff/checkin') ? 'primary' : 'inherit'}
                   sx={{ fontWeight: isActive('/staff/checkin') ? 600 : 500 }}
                 >
                   Check-in
                 </Button>
              )}
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton component={RouterLink} to="/cart" color="inherit">
                <Badge badgeContent={getCartItemCount()} color="primary">
                  <ShoppingCartOutlinedIcon color="action" />
                </Badge>
              </IconButton>

              {isAuthenticated ? (
                <>
                  <Button
                    onClick={handleMenu}
                    color="inherit"
                    endIcon={<ExpandMoreIcon />}
                    startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>{user?.fullName?.charAt(0) || 'U'}</Avatar>}
                    sx={{ textTransform: 'none', px: 1 }}
                  >
                    <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
                      {user?.fullName?.split(' ')[0]}
                    </Typography>
                  </Button>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        mt: 1.5,
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                  >
                    <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                      <PersonOutlineIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} /> Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        Logout
                      </Box>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button component={RouterLink} to="/login" variant="text" color="inherit">Login</Button>
                  <Button component={RouterLink} to="/register" variant="contained" color="primary" disableElevation>Register</Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Box>

      <Box component="footer" sx={{ py: 6, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ConfirmationNumberOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="text.primary" fontWeight="bold">
                  EventHub
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                The most reliable platform for discovering and booking events. 
                Secure, fast, and easy to use.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>Product</Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/events" color={isActive('/events') ? 'primary' : 'text.secondary'} sx={{ fontWeight: isActive('/events') ? 'bold' : 'normal' }} underline="hover">Events</MuiLink></Box>
                <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/pricing" color={isActive('/pricing') ? 'primary' : 'text.secondary'} sx={{ fontWeight: isActive('/pricing') ? 'bold' : 'normal' }} underline="hover">Pricing</MuiLink></Box>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>Company</Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/about" color={isActive('/about') ? 'primary' : 'text.secondary'} sx={{ fontWeight: isActive('/about') ? 'bold' : 'normal' }} underline="hover">About</MuiLink></Box>
                <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/careers" color={isActive('/careers') ? 'primary' : 'text.secondary'} sx={{ fontWeight: isActive('/careers') ? 'bold' : 'normal' }} underline="hover">Careers</MuiLink></Box>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>Legal</Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/terms" color={isActive('/terms') ? 'primary' : 'text.secondary'} sx={{ fontWeight: isActive('/terms') ? 'bold' : 'normal' }} underline="hover">Terms</MuiLink></Box>
                <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/privacy" color={isActive('/privacy') ? 'primary' : 'text.secondary'} sx={{ fontWeight: isActive('/privacy') ? 'bold' : 'normal' }} underline="hover">Privacy</MuiLink></Box>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} EventHub Inc. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
