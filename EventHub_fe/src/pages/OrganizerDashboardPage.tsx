import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Box,
  CircularProgress,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  Tabs,
  Tab,
  CardHeader,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { EventsService } from '../api/services/EventsService';
import type { Event } from '../api/models/Event';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { UsersService } from '../api/services/UsersService';
import { OrganizationService } from '../api/services/OrganizationService';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { motion } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const OrganizerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState(0);
  const [staffEmail, setStaffEmail] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [staffLoading, setStaffLoading] = useState(false);

  // Status types
  const statuses = ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'CANCELLED'];
  const statusColors: { [key: string]: 'default' | 'warning' | 'success' | 'error' } = {
    DRAFT: 'default',
    PENDING_APPROVAL: 'warning',
    PUBLISHED: 'success',
    CANCELLED: 'error',
  };

  useEffect(() => {
    fetchOrganizerEvents();
  }, [user]);

  useEffect(() => {
    // Filter events based on selected tab
    if (tabValue === 0) {
      setFilteredEvents(events);
    } else {
      const status = statuses[tabValue - 1];
      setFilteredEvents(events.filter(e => e.status === status));
    }
  }, [tabValue, events]);

  const fetchOrganizerEvents = async () => {
    if (!user?.id) {
      showNotification('User not authenticated.', 'error');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all events and filter by organizerId
      const response = await EventsService.getApiEventsSearch(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      const allEvents = response.content || [];
      const organizerManagedEvents = allEvents.filter(event => event.organizerId === user.id);
      setEvents(organizerManagedEvents);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to fetch your events.';
      showNotification(errorMessage, 'error');
      console.error("Failed to fetch organizer events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    try {
      await EventsService.deleteApiEvents(eventId);
      showNotification('Event deleted successfully!', 'success');
      fetchOrganizerEvents();
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to delete event.';
      showNotification(errorMessage, 'error');
    }
  };

  const organizerOrgId = user?.organizationRoles?.find(role => role.roleName === 'ORGANIZER')?.organizationId;

  const handleGrantStaffRole = async () => {
    if (!organizerOrgId) {
      showNotification('Organizer organization not found.', 'error');
      return;
    }
    if (!staffEmail.trim()) {
      showNotification('Enter a user email to grant STAFF role.', 'error');
      return;
    }
    setStaffLoading(true);
    try {
      const userId = await UsersService.getApiUsersIdByEmail(staffEmail.trim());
      await OrganizationService.postApiOrganizationsUsersRolesByName(organizerOrgId, userId, 'STAFF');
      showNotification('Staff role granted successfully.', 'success');
      setStaffEmail('');
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to grant staff role.';
      showNotification(errorMessage, 'error');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleAssignStaffToEvent = async () => {
    if (!staffEmail.trim()) {
      showNotification('Please enter a staff email address.', 'error');
      return;
    }
    if (!selectedEventId) {
      showNotification('Please select an event.', 'error');
      return;
    }

    // Verify the selected event belongs to the current organizer
    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (!selectedEvent || selectedEvent.organizerId !== user?.id) {
      showNotification('You can only assign staff to your own events.', 'error');
      return;
    }

    setStaffLoading(true);
    try {
      // Get user ID by email
      const userId = await UsersService.getApiUsersIdByEmail(staffEmail.trim());
      
      // Grant STAFF role if organizer organization exists
      if (organizerOrgId) {
        try {
          await OrganizationService.postApiOrganizationsUsersRolesByName(organizerOrgId, userId, 'STAFF');
        } catch (roleErr: any) {
          // If role granting fails, continue with event assignment
          console.warn('Staff role grant failed, but continuing with event assignment:', roleErr);
        }
      }
      
      // Assign staff to event
      await UsersService.postApiUsersAssignedEvents(userId, Number(selectedEventId));
      showNotification(`Staff assigned to "${selectedEvent.name}" successfully.`, 'success');
      setStaffEmail('');
      setSelectedEventId('');
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to assign staff.';
      showNotification(errorMessage, 'error');
    } finally {
      setStaffLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Organizer Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={RouterLink} to="/organizer/events/new" variant="contained" startIcon={<AddIcon />}>
            New Event
          </Button>
          <Button component={RouterLink} to="/organizer/orders" variant="outlined" startIcon={<ListAltIcon />}>
            Orders
          </Button>
          <Button component={RouterLink} to="/organizer/reports" variant="outlined" color="success" startIcon={<AssessmentIcon />}>
            Reports
          </Button>
        </Box>
      </Box>

      {/* Staff Management Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Assign Staff to Your Events</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Add staff members to help manage your events. They will receive the STAFF role and be assigned to the selected event.
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 1fr' }, alignItems: 'center' }}>
            <TextField
              label="Staff Email"
              placeholder="Enter staff member email"
              value={staffEmail}
              onChange={e => setStaffEmail(e.target.value)}
              size="small"
              fullWidth
            />
            <FormControl fullWidth size="small">
              <InputLabel>Select Your Event</InputLabel>
              <Select
                label="Select Your Event"
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value as number | '')}
              >
                <MenuItem value="">
                  <em>Choose an event...</em>
                </MenuItem>
                {events.filter(event => event.status === 'PUBLISHED').map(event => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              onClick={handleAssignStaffToEvent}
              variant="contained"
              disabled={staffLoading || !staffEmail.trim() || !selectedEventId}
              fullWidth
            >
              {staffLoading ? 'Assigning...' : 'Assign Staff'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Events by Status */}
      <Card>
        <CardHeader title="My Events" />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="event status tabs"
          >
            <Tab label={`All (${events.length})`} />
            {statuses.map((status) => {
              const count = events.filter(e => e.status === status).length;
              return (
                <Tab
                  key={status}
                  label={`${status} (${count})`}
                />
              );
            })}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {events.length === 0 ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No events created yet.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      {event.coverImage && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={event.coverImage}
                          alt={event.name}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={event.status}
                            color={statusColors[event.status!] || 'default'}
                            size="small"
                          />
                          {event.status === 'PUBLISHED' && (
                            <Chip
                              label="Promotion Available"
                              icon={<ConfirmationNumberIcon />}
                              variant="outlined"
                              size="small"
                              color="success"
                            />
                          )}
                        </Box>
                        <Typography gutterBottom variant="h6" component="div">
                          {event.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.venue?.name}, {event.venue?.city}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ pt: 0 }}>
                        <Button size="small" component={RouterLink} to={`/organizer/events/${event.id}`}>
                          View
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteEvent(event.id!)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {statuses.map((status, statusIndex) => (
          <TabPanel key={status} value={tabValue} index={statusIndex + 1}>
            {filteredEvents.length === 0 ? (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No events with status "{status}".
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {filteredEvents.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                        }}
                      >
                        {event.coverImage && (
                          <CardMedia
                            component="img"
                            height="200"
                            image={event.coverImage}
                            alt={event.name}
                          />
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={event.status}
                              color={statusColors[event.status!] || 'default'}
                              size="small"
                            />
                            {event.status === 'PUBLISHED' && (
                              <Chip
                                label="Promotion Available"
                                icon={<ConfirmationNumberIcon />}
                                variant="outlined"
                                size="small"
                                color="success"
                              />
                            )}
                          </Box>
                          <Typography gutterBottom variant="h6" component="div">
                            {event.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.venue?.name}, {event.venue?.city}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ pt: 0 }}>
                          <Button size="small" component={RouterLink} to={`/organizer/events/${event.id}`}>
                            View
                          </Button>
                          {event.status === 'PUBLISHED' && (
                            <Button size="small" color="success" component={RouterLink} to={`/organizer/promotions/${event.id}`}>
                              Promotions
                            </Button>
                          )}
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteEvent(event.id!)}
                          >
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        ))}
      </Card>
    </Container>
  );
};

export default OrganizerDashboardPage;
