import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Card, CardContent, Alert, CircularProgress, Button, List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import { OrdersService } from '../api/services/OrdersService';
import type { OrderResponse } from '../api/models/OrderResponse';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id) : undefined;
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
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
        if (fetchedOrder.userId !== user.id && !user.roles?.some(r => (r as any).authority === 'ROLE_ADMIN') && !user.roles?.some(r => (r as any).authority === 'ROLE_ORGANIZER')) {
            showNotification('You are not authorized to view this order.', 'error');
            setLoading(false);
            return;
        }
        setOrder(fetchedOrder);
      } catch (err: any) {
        showNotification(err.message || 'Failed to fetch order details.', 'error');
        console.error("Failed to fetch order details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, showNotification]);

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
            <Button component={RouterLink} to="/events" variant="outlined" sx={{ mt: 2 }}>Browse Events</Button>
        </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Card sx={{ textAlign: 'center', py: 4 }}>
        <CardContent>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h3" color="success.main" gutterBottom>
            Order Confirmed!
          </Typography>
          <Typography variant="h6" paragraph>
            Your order <strong>#{order.id}</strong> has been successfully placed.
          </Typography>
          <Alert severity="info" sx={{ mb: 4, display: 'inline-flex' }}>
            An email with your tickets and order details has been sent to {user?.email}.
          </Alert>

          <Box sx={{ textAlign: 'left', maxWidth: '600px', mx: 'auto', mb: 4 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Card variant="outlined">
              <List>
                <ListItem divider>
                  <ListItemText primary="Event ID" secondary={order.eventId} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Total Amount" secondary={`$${(order.totalAmount || 0).toFixed(2)} ${order.currency}`} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Payment Method" secondary={order.paymentMethod} />
                </ListItem>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary">Items:</Typography>
                    <ul style={{ margin: '0', paddingLeft: '20px' }}>
                      {order.items?.map((item, index) => (
                        <li key={index}>
                          <Typography variant="body2">
                            Ticket Type {item.ticketTypeId}: {item.tickets?.length || 0} tickets @ ${(item.price || 0).toFixed(2)} each
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                </ListItem>
              </List>
            </Card>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button component={RouterLink} to={`/my-orders/${order.id}`} variant="contained">
              View Order Details
            </Button>
            <Button component={RouterLink} to="/events" variant="outlined">
              Continue Shopping
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderConfirmationPage;
