import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Button, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { OrdersService } from '../api/services/OrdersService';
import type { OrderResponse } from '../api/models/OrderResponse';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';

const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user?.id) {
        showNotification('User not authenticated.', 'error');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedOrders = await OrdersService.getApiOrdersUser(user.id);
        setOrders(fetchedOrders);
      } catch (err: any) {
        showNotification(err.message || 'Failed to fetch your orders.', 'error');
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, showNotification]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Order History
      </Typography>
      
      {orders.length > 0 ? (
        <Grid container spacing={3}>
          {orders.map((order, index) => (
            <Grid item xs={12} sm={6} md={4} key={order.id}>
              <Card 
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Order #{order.id}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Typography variant="body1" sx={{ 
                      color: order.status === 'PAID' ? 'success.main' : 
                             order.status === 'PENDING' ? 'warning.main' : 'error.main',
                      fontWeight: 'bold'
                    }}>
                      {order.status}
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    <strong>Event ID:</strong> {order.eventId}<br />
                    <strong>Total:</strong> ${order.totalAmount.toFixed(2)} {order.currency}<br />
                    <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    component={RouterLink} 
                    to={`/my-orders/${order.id}`} 
                    variant="contained" 
                    fullWidth
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 4 }}>
          You haven't placed any orders yet. <RouterLink to="/events" style={{ color: 'inherit', fontWeight: 'bold' }}>Find events</RouterLink>!
        </Alert>
      )}
    </Container>
  );
};

export default OrderHistoryPage;
