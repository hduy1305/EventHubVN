import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Card, CardContent, CircularProgress, Button, List, ListItem, ListItemText, Typography, Grid, Box, Alert, Chip } from '@mui/material';
import { OrdersService } from '../api/services/OrdersService';
import { TicketsService } from '../api/services/TicketsService';
import type { OrderResponse } from '../api/models/OrderResponse';
import type { TicketResponse } from '../api/models/TicketResponse';
import type { Event } from '../api/models/Event';
import { useAuth } from '../context/AuthContext';
import TicketTransferModal from '../components/TicketTransferModal';
import { EventsService } from '../api/services/EventsService';
import { useNotification } from '../context/NotificationContext';
import { generateTicketPDF } from '../utils/pdfGenerator'; // Import PDF generator

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id) : undefined;
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [eventDetails, setEventDetails] = useState<Event | null>(null); // Store full event details
  const [loading, setLoading] = useState<boolean>(true);
  
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTicketCodeForTransfer, setSelectedTicketCodeForTransfer] = useState<string>('');

  useEffect(() => {
    fetchOrderAndTickets();
  }, [orderId, user]);

  const fetchOrderAndTickets = async () => {
    if (!orderId) {
      showNotification('Invalid order ID.', 'error');
      setLoading(false);
      return;
    }
    if (!user?.id) {
      showNotification('User not authenticated.', 'error');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetchedOrder = await OrdersService.getApiOrders(orderId);
      if (fetchedOrder.userId !== user.id && !user.roles?.includes('ADMIN') && !user.roles?.includes('ORGANIZER')) {
          showNotification('You are not authorized to view this order.', 'error');
          setLoading(false);
          return;
      }
      setOrder(fetchedOrder);

      const fetchedTickets = await OrdersService.getApiOrdersTickets(orderId);
      setTickets(fetchedTickets);

      if (fetchedOrder.eventId) {
        const fetchedEvent = await EventsService.getApiEvents1(fetchedOrder.eventId);
        setEventDetails(fetchedEvent); // Save event details for PDF
      }

    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to fetch order details or tickets.';
      showNotification(errorMessage, 'error');
      console.error("Failed to fetch order details or tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (ticketCode: string) => {
    const ticket = tickets.find(t => t.ticketCode === ticketCode);
    if (!ticket) {
        showNotification('Ticket not found.', 'error');
        return;
    }
    
    showNotification(`Generating ticket PDF for ${ticketCode}...`, 'info');
    try {
        await generateTicketPDF(ticket, eventDetails);
        showNotification('Ticket downloaded successfully!', 'success');
    } catch (err) {
        console.error("PDF generation failed:", err);
        showNotification('Failed to generate ticket PDF.', 'error');
    }
  };

  const handleOpenTransferModal = (ticketCode: string) => {
    setSelectedTicketCodeForTransfer(ticketCode);
    setShowTransferModal(true);
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setSelectedTicketCodeForTransfer('');
  };

  const handleTicketTransferSuccess = () => {
    fetchOrderAndTickets();
    showNotification('Ticket transfer initiated successfully!', 'success');
    handleCloseTransferModal();
  };

  const handleCancelOrder = async () => {
    if (!orderId || !order) return;

    if (!window.confirm('Are you sure you want to cancel this order? This action might be irreversible.')) {
      return;
    }

    try {
      await OrdersService.putApiOrdersCancel(orderId);
      showNotification('Order cancellation request submitted. Status will update shortly.', 'success');
      fetchOrderAndTickets();
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to cancel order.';
      showNotification(errorMessage, 'error');
      console.error("Failed to cancel order:", err);
    }
  };

  // Safely access event properties, defaulting to false/0 if eventDetails is null
  const canCancelOrder = order && eventDetails?.refundEnabled && order.status === 'PAID';
  const eventAllowTicketTransfer = eventDetails?.allowTicketTransfer || false;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
        <Container sx={{ mt: 5, textAlign: 'center' }}>
            <Typography>Order not found or an error occurred.</Typography>
            <Button component={RouterLink} to="/my-tickets" variant="outlined" sx={{ mt: 2 }}>Back to My Tickets</Button>
        </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Order Details #{order.id}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <List>
                <ListItem divider>
                  <ListItemText primary="Status" />
                  <Chip label={order.status} color={order.status === 'PAID' ? 'success' : 'default'} size="small" />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Total" secondary={`$${order.totalAmount.toFixed(2)} ${order.currency}`} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Date" secondary={new Date(order.createdAt).toLocaleDateString()} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Payment" secondary={order.paymentMethod} />
                </ListItem>
              </List>
              {canCancelOrder && (
                <Button variant="outlined" color="error" fullWidth onClick={handleCancelOrder} sx={{ mt: 2 }}>
                  Request Cancellation
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>Tickets</Typography>
          {tickets.length > 0 ? (
            <Grid container spacing={2}>
              {tickets.map((ticket) => (
                <Grid item xs={12} sm={6} key={ticket.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{ticket.ticketCode}</Typography>
                      <Typography color="text.secondary" gutterBottom>Status: {ticket.status}</Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2"><strong>Attendee:</strong> {ticket.attendeeName}</Typography>
                        <Typography variant="caption" color="text.secondary">{ticket.attendeeEmail}</Typography>
                        {ticket.seatLabel && <Typography variant="body2"><strong>Seat:</strong> {ticket.seatLabel}</Typography>}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" size="small" onClick={() => handleDownloadTicket(ticket.ticketCode!)}>
                          Download
                        </Button>
                        {eventAllowTicketTransfer && ticket.status === 'ISSUED' && (
                          <Button variant="outlined" size="small" onClick={() => handleOpenTransferModal(ticket.ticketCode!)}>
                            Transfer
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No tickets found for this order.</Alert>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button component={RouterLink} to="/my-tickets" color="inherit">Back to My Tickets</Button>
      </Box>

      {selectedTicketCodeForTransfer && (
        <TicketTransferModal
          show={showTransferModal}
          onHide={handleCloseTransferModal}
          ticketCode={selectedTicketCodeForTransfer}
          onTransferSuccess={handleTicketTransferSuccess}
        />
      )}
    </Container>
  );
};

export default OrderDetailsPage;
