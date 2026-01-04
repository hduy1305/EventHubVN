import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, MenuItem, CircularProgress, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { OrdersService } from '../api/services/OrdersService';
import { EventsService } from '../api/services/EventsService';
import type { OrderResponse } from '../api/models/OrderResponse';
import type { Event } from '../api/models/Event';
import { EventStatus } from '../api/models/EventStatus';
import { OrderStatus } from '../api/models/OrderStatus';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const OrganizerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('');

  const [showResendModal, setShowResendModal] = useState(false);
  const [resendOrderId, setResendOrderId] = useState<number | null>(null);
  const [resendRecipientEmail, setResendRecipientEmail] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      showNotification('User not authenticated.', 'error');
      setLoading(false);
      return;
    }
    fetchOrganizerData();
  }, [user]);

  const fetchOrganizerData = async () => {
    setLoading(true);
    try {
      const response = await EventsService.getApiEventsSearch(undefined, undefined, undefined, undefined, undefined, undefined, EventStatus.PUBLISHED);
      const allEvents = response.content || [];
      const organizerManagedEvents = allEvents.filter(event => event.organizerId === user?.id);
      setEvents(organizerManagedEvents);

      let allOrdersForOrganizer: OrderResponse[] = [];
      for (const event of organizerManagedEvents) {
        const eventOrders = await OrdersService.getApiOrdersEvent(
          event.id!,
          selectedOrderStatus ? (selectedOrderStatus as OrderStatus) : undefined
        );
        allOrdersForOrganizer = [...allOrdersForOrganizer, ...eventOrders];
      }

      const finalOrders = selectedEventId
        ? allOrdersForOrganizer.filter(order => order.eventId === parseInt(selectedEventId))
        : allOrdersForOrganizer;

      setOrders(finalOrders);
      if (finalOrders.length === 0 && (selectedEventId || selectedOrderStatus)) {
        showNotification('No orders found for your events matching the criteria.', 'info');
      }

    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to fetch organizer data.';
      showNotification(errorMessage, 'error');
      console.error("Failed to fetch organizer data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    fetchOrganizerData();
  };

  const handleResendTickets = async () => {
    if (!resendOrderId || !resendRecipientEmail) {
        showNotification('Please provide order ID and recipient email.', 'warning');
        return;
    }

    setResendLoading(true);
    try {
      await OrdersService.postApiOrdersResendTickets(resendOrderId, resendRecipientEmail);
      showNotification('Tickets resent successfully!', 'success');
      setShowResendModal(false);
      setResendRecipientEmail('');
      setResendOrderId(null);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to resend tickets.';
      showNotification(errorMessage, 'error');
      console.error("Failed to resend tickets:", err);
    } finally {
      setResendLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number, currentStatus: OrderStatus) => {
    if (currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED') {
      showNotification('Order is already cancelled or refunded.', 'warning');
      return;
    }
    if (!window.confirm(`Are you sure you want to cancel/refund order #${orderId}?`)) {
      return;
    }
    setLoading(true);
    try {
      await OrdersService.putApiOrdersCancel(orderId);
      showNotification(`Order #${orderId} has been cancelled/refunded.`, 'success');
      fetchOrganizerData();
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to cancel/refund order.';
      showNotification(errorMessage, 'error');
      console.error("Failed to cancel/refund order:", err);
    } finally {
      setLoading(false);
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>Manage Orders</Typography>
      
      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              select
              label="Filter by Event"
              fullWidth
              size="small"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <MenuItem value="">All Events</MenuItem>
              {events.map(event => (
                <MenuItem key={event.id} value={event.id}>{event.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Filter by Status"
              fullWidth
              size="small"
              value={selectedOrderStatus}
              onChange={(e) => setSelectedOrderStatus(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {Object.values(OrderStatus).map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" fullWidth onClick={handleFilterChange}>Apply</Button>
            <Button variant="outlined" fullWidth onClick={() => { setSelectedEventId(''); setSelectedOrderStatus(''); fetchOrganizerData(); }}>Clear</Button>
          </Grid>
        </Grid>
      </Card>

      <Typography variant="h6" gutterBottom>Orders ({orders.length})</Typography>
      {orders.length === 0 ? (
        <Typography color="text.secondary">No orders found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Order #{order.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Event: {events.find(e => e.id === order.eventId)?.name || order.eventId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User ID: {order.userId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: ${order.totalAmount} {order.currency}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Chip 
                      label={order.status} 
                      color={order.status === 'PAID' ? 'success' : order.status === 'PENDING' ? 'warning' : 'error'} 
                      size="small" 
                      sx={{ mr: 2 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button component={RouterLink} to={`/my-orders/${order.id}`} variant="contained" size="small">
                      Details
                    </Button>
                    {order.status === 'PAID' && (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setResendOrderId(order.id!);
                            setResendRecipientEmail('');
                            setShowResendModal(true);
                          }}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {if (!order.status) return;
                            handleCancelOrder(order.id!,  order.status as OrderStatus);
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Resend Tickets Modal */}
      <Dialog open={showResendModal} onClose={() => setShowResendModal(false)}>
        <DialogTitle>Resend Tickets for Order #{resendOrderId}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Recipient Email"
            type="email"
            fullWidth
            variant="outlined"
            value={resendRecipientEmail}
            onChange={(e) => setResendRecipientEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResendModal(false)}>Cancel</Button>
          <Button onClick={handleResendTickets} disabled={resendLoading || !resendRecipientEmail} variant="contained">
            {resendLoading ? <CircularProgress size={24} /> : 'Resend'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizerOrdersPage;
