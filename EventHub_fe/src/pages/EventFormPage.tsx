import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, TextField, Button, Box, FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { EventsService } from '../api/services/EventsService';
import type { Event } from '../api/models/Event';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import TicketTypeManagement from '../components/TicketTypeManagement';
import SeatManagement from '../components/SeatManagement';
import DiscountManagement from '../components/DiscountManagement';

const EventFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [eventData, setEventData] = useState<Partial<Event>>({
    name: '',
    description: '',
    category: '',
    startTime: '',
    endTime: '',
    coverImage: '',
    allowTicketTransfer: false,
    allowAttendeeNameChange: false,
    refundEnabled: false,
    refundDeadlineHours: 0,
    refundFeePercent: 0,
    venue: {
      name: '',
      address: '',
      city: '',
      capacity: 0,
      mapImage: '',
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (eventId) {
      setLoading(true);
      EventsService.getApiEvents1(eventId)
        .then(fetchedEvent => {
          setEventData({
            name: fetchedEvent.name,
            description: fetchedEvent.description,
            category: fetchedEvent.category,
            startTime: fetchedEvent.startTime,
            endTime: fetchedEvent.endTime,
            coverImage: fetchedEvent.coverImage,
            allowTicketTransfer: fetchedEvent.allowTicketTransfer,
            allowAttendeeNameChange: fetchedEvent.allowAttendeeNameChange,
            refundEnabled: fetchedEvent.refundEnabled,
            refundDeadlineHours: fetchedEvent.refundDeadlineHours,
            refundFeePercent: fetchedEvent.refundFeePercent,
            venue: fetchedEvent.venue || { name: '', address: '', city: '', capacity: 0, mapImage: '' },
            status: fetchedEvent.status,
          });
        })
        .catch(err => {
          showNotification(err.message || 'Failed to load event for editing.', 'error');
          console.error("Failed to load event:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [eventId, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle checkbox separately as `value` is not the checked state
    // But since we use specific handler or type check...
    // MUI TextField for text/number/datetime-local passes value correctly.
    // Checkboxes use `checked`.
    setEventData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleVenueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      venue: {
        ...prev.venue,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.id) {
        showNotification('User not authenticated.', 'error');
        setLoading(false);
        return;
    }

    try {
      if (eventId) {
        await EventsService.putApiEvents(eventId, { ...eventData, organizerId: user.id } as Event);
        showNotification('Event updated successfully!', 'success');
      } else {
        await EventsService.postApiEvents({ ...eventData, organizerId: user.id } as Event);
        showNotification('Event created successfully!', 'success');
      }
      setTimeout(() => navigate('/organizer/dashboard'), 2000);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to save event.';
      showNotification(errorMessage, 'error');
      console.error("Failed to save event:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      await EventsService.postApiEventsIdSubmit(eventId);
      showNotification('Event submitted for approval successfully!', 'success');
      // Update local state to reflect new status
      setEventData(prev => ({ ...prev, status: 'PENDING_APPROVAL' }));
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to submit event for approval.';
      showNotification(errorMessage, 'error');
      console.error("Failed to submit event:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !eventData.name && eventId) { // Only show full loading if initializing edit
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        {eventId ? 'Edit Event' : 'Create New Event'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Event Details Section */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Event Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Event Name"
                      name="name"
                      fullWidth
                      required
                      value={eventData.name || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      name="description"
                      multiline
                      rows={4}
                      fullWidth
                      required
                      value={eventData.description || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Category"
                      name="category"
                      fullWidth
                      required
                      value={eventData.category || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Cover Image URL"
                      name="coverImage"
                      fullWidth
                      value={eventData.coverImage || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Time"
                      name="startTime"
                      type="datetime-local"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      value={eventData.startTime ? new Date(eventData.startTime).toISOString().slice(0, 16) : ''}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="End Time"
                      name="endTime"
                      type="datetime-local"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      value={eventData.endTime ? new Date(eventData.endTime).toISOString().slice(0, 16) : ''}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Venue Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Venue Name"
                      name="name"
                      fullWidth
                      value={eventData.venue?.name || ''}
                      onChange={handleVenueChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      name="address"
                      fullWidth
                      value={eventData.venue?.address || ''}
                      onChange={handleVenueChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="City"
                      name="city"
                      fullWidth
                      value={eventData.venue?.city || ''}
                      onChange={handleVenueChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Capacity"
                      name="capacity"
                      type="number"
                      fullWidth
                      value={eventData.venue?.capacity || ''}
                      onChange={handleVenueChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Seating Chart Image URL"
                      name="mapImage"
                      fullWidth
                      value={eventData.venue?.mapImage || ''}
                      onChange={handleVenueChange}
                      helperText="If provided, enables seat selection features."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Policies Section */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 24 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Policies</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={<Checkbox checked={eventData.allowTicketTransfer || false} onChange={handleCheckboxChange} name="allowTicketTransfer" />}
                    label="Allow Ticket Transfer"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={eventData.allowAttendeeNameChange || false} onChange={handleCheckboxChange} name="allowAttendeeNameChange" />}
                    label="Allow Name Change"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={eventData.refundEnabled || false} onChange={handleCheckboxChange} name="refundEnabled" />}
                    label="Enable Refunds"
                  />
                  
                  {eventData.refundEnabled && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Refund Deadline (Hours before)"
                        name="refundDeadlineHours"
                        type="number"
                        size="small"
                        fullWidth
                        value={eventData.refundDeadlineHours || 0}
                        onChange={handleChange} // Use standard handler for numbers
                      />
                      <TextField
                        label="Refund Fee (%)"
                        name="refundFeePercent"
                        type="number"
                        size="small"
                        fullWidth
                        inputProps={{ step: "0.01" }}
                        value={eventData.refundFeePercent || 0}
                        onChange={handleChange}
                      />
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button variant="contained" type="submit" size="large" fullWidth disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : (eventId ? 'Update Event' : 'Create Event')}
                  </Button>
                  {eventId && eventData.status === 'DRAFT' && (
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      fullWidth 
                      onClick={handleSubmitForApproval} 
                      disabled={loading}
                    >
                      Submit for Approval
                    </Button>
                  )}
                  <Button variant="outlined" color="inherit" fullWidth onClick={() => navigate('/organizer/dashboard')}>
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>

      {/* Sub-management Sections (Only visible for existing events) */}
      {eventId && (
        <Box sx={{ mt: 4 }}>
          <TicketTypeManagement eventId={eventId} />
          {eventData.venue?.mapImage && (
            <Box sx={{ mt: 4 }}>
              <SeatManagement eventId={eventId} />
            </Box>
          )}
          <Box sx={{ mt: 4 }}>
            <DiscountManagement eventId={eventId} />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default EventFormPage;