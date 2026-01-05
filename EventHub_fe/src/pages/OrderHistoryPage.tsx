import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Button, Typography, Box, CircularProgress, Alert, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { OrdersService } from '../api/services/OrdersService';
import type { OrderResponse } from '../api/models/OrderResponse';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefundIcon from '@mui/icons-material/Undo';

const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refundDialog, setRefundDialog] = useState<{ open: boolean; orderId?: number }>({ open: false });
  const [refundReason, setRefundReason] = useState<string>('');
  const [refunding, setRefunding] = useState<boolean>(false);

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

  const handleRequestRefund = async () => {
    if (!refundDialog.orderId || !refundReason.trim()) {
      showNotification('Please enter a reason for refund.', 'warning');
      return;
    }
    setRefunding(true);
    try {
      // Call refund API - TODO: implement backend refund endpoint
      // await OrdersService.postApiOrdersRefund(refundDialog.orderId, { reason: refundReason.trim() });
      showNotification('Refund request submitted. Please contact support for further assistance.', 'success');
      setRefundDialog({ open: false });
      setRefundReason('');
      // Refresh orders
      if (user?.id) {
        const updatedOrders = await OrdersService.getApiOrdersUser(user.id);
        setOrders(updatedOrders);
      }
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to request refund.';
      showNotification(errorMessage, 'error');
    } finally {
      setRefunding(false);
    }
  };

  const handleDownloadInvoice = (order: OrderResponse) => {
    // Generate simple invoice
    const invoiceData = `
INVOICE
=======================================
Order #${order.id}
Date: ${new Date(order.createdAt || '').toLocaleDateString()}
Status: ${order.status}

Event ID: ${order.eventId}
Total Amount: $${(order.totalAmount || 0).toFixed(2)} ${order.currency}
Payment Method: ${order.paymentMethod || 'N/A'}

Items:
${order.items?.map(item => `- Ticket #${item.id}: ${item.ticketTypeId || 'N/A'}`).join('\n') || 'N/A'}

Thank you for your purchase!
    `;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceData));
    element.setAttribute('download', `invoice-${order.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification('Invoice downloaded!', 'success');
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ m: 0 }}>
                      Order #{order.id}
                    </Typography>
                    <Chip 
                      label={order.status} 
                      color={order.status === 'PAID' ? 'success' : order.status === 'PENDING' ? 'warning' : order.status === 'REFUNDED' ? 'info' : 'error'} 
                      size="small"
                      variant="filled"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Order Date</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Total Amount</Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="700">
                      ${(order.totalAmount || 0).toFixed(2)} {order.currency}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Payment Method</Typography>
                    <Typography variant="body2">
                      {order.paymentMethod || 'N/A'}
                    </Typography>
                  </Box>

                  {order.items && order.items.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Items ({order.items.length})</Typography>
                      {order.items.map((item, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary">
                          • Ticket ID: {item.id} - ${(item.price || 0).toFixed(2)}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Button 
                    component={RouterLink} 
                    to={`/my-orders/${order.id}`} 
                    variant="contained" 
                    fullWidth
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => handleDownloadInvoice(order)}
                    fullWidth
                  >
                    Download Invoice
                  </Button>
                  {order.status === 'PAID' && (
                    <Button 
                      variant="outlined" 
                      size="small"
                      color="error"
                      startIcon={<RefundIcon />}
                      onClick={() => setRefundDialog({ open: true, orderId: order.id })}
                      fullWidth
                    >
                      Request Refund
                    </Button>
                  )}
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

      {/* Refund Request Dialog */}
      <Dialog open={refundDialog.open} onClose={() => setRefundDialog({ open: false })}>
        <DialogTitle>Request Refund</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Please tell us why you want to request a refund. We'll review your request and get back to you within 5-7 business days.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Refund Reason"
            placeholder="Please explain the reason for your refund request..."
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog({ open: false })}>Cancel</Button>
          <Button 
            onClick={handleRequestRefund} 
            variant="contained" 
            color="error"
            disabled={refunding || !refundReason.trim()}
          >
            {refunding ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderHistoryPage;
