import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Tabs, Tab, Box, CircularProgress, Card, CardContent, CardActions, Button, Chip, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { EventsService } from '../api/services/EventsService';
import type { Event } from '../api/models/Event';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';
import { EventStatus } from '../api/models/EventStatus';

const AdminEventApprovalPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<EventStatus>(EventStatus.PENDING_APPROVAL);

  const fetchEventsByStatus = useCallback(async (status: EventStatus) => {
    setLoading(true);
    try {
      const response = await EventsService.getApiEventsSearch(
        undefined, // keyword
        undefined, // category
        undefined, // start
        undefined, // end
        undefined, // min
        undefined, // max
        status,    // status
        undefined, // location
        undefined, // page (use backend default)
        undefined  // size
      );
      setEvents(response.content || []);
    } catch (err: any) {
      const errorData = getErrorMessage(err, `Không thể tải danh sách sự kiện. Vui lòng thử lại sau.`);
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchEventsByStatus(currentTab);
  }, [currentTab, fetchEventsByStatus]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: EventStatus) => {
    setCurrentTab(newValue);
  };

  const handleApprove = async (eventId: number) => {
    try {
      await EventsService.postApiEventsIdApprove(eventId);
      showNotification(`Event ${eventId} has been approved.`, 'success');
      fetchEventsByStatus(currentTab);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể duyệt sự kiện. Vui lòng thử lại sau.');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    }
  };

  const handleCancel = async (eventId: number) => {
    try {
      await EventsService.postApiEventsIdCancel(eventId);
      showNotification(`Event ${eventId} has been cancelled.`, 'success');
      fetchEventsByStatus(currentTab);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể hủy bỏ sự kiện. Vui lòng thử lại sau.');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Event Approval
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="event status tabs">
          <Tab label="Pending Approval" value={EventStatus.PENDING_APPROVAL} />
          <Tab label="Approved" value={EventStatus.PUBLISHED} />
          <Tab label="Cancelled" value={EventStatus.CANCELLED} />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {events.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No events found with status: {currentTab}</Typography>
            </Grid>
          ) : (
            events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{event.name}</Typography>
                    <Typography color="text.secondary">Organizer ID: {event.organizerId}</Typography>
                    <Chip label={event.status} color={
                      event.status === EventStatus.PENDING_APPROVAL ? 'warning' :
                      event.status === EventStatus.PUBLISHED ? 'success' : 'error'
                    } sx={{ mt: 1 }} />
                  </CardContent>
                  <CardActions>
                    {currentTab === EventStatus.PENDING_APPROVAL && (
                      <>
                        <Button size="small" onClick={() => handleApprove(event.id!)}>Approve</Button>
                        <Button size="small" color="error" onClick={() => handleCancel(event.id!)}>Reject</Button>
                      </>
                    )}
                    {currentTab === EventStatus.PUBLISHED && (
                      <Button size="small" color="error" onClick={() => handleCancel(event.id!)}>Cancel</Button>
                    )}
                    <Button size="small" component={RouterLink} to={`/events/${event.id}`}>View Details</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

export default AdminEventApprovalPage;
