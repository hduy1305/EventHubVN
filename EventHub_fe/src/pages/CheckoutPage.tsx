import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Button, List, ListItem, Typography, TextField, MenuItem, CircularProgress, Box, Alert } from '@mui/material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EventsService } from '../api/services/EventsService';
import type { Discount } from '../api/models/Discount';
import { OrdersService } from '../api/services/OrdersService';
import type { OrderItemRequest } from '../api/models/OrderItemRequest';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';

const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      showNotification('You need to be logged in to checkout.', 'warning');
      navigate('/login');
    }
    if (cartItems.length === 0) {
      showNotification('Your cart is empty. Please add items before checking out.', 'info');
      navigate('/cart');
    }
  }, [isAuthenticated, cartItems, navigate, showNotification]);

  const handleApplyDiscount = async () => {
    if (!discountCode) {
      showNotification('Please enter a discount code.', 'warning');
      return;
    }
    if (cartItems.length === 0) {
      showNotification('Cart is empty. Cannot apply discount.', 'warning');
      return;
    }

    // Check if all items are from the same event
    const eventIds = [...new Set(cartItems.map(item => item.eventId))];
    if (eventIds.length > 1) {
      showNotification('Your cart contains tickets from multiple events. Discount can only be applied to one event at a time.', 'error');
      return;
    }

    const eventId = eventIds[0]; 

    try {
      const discount = await EventsService.getApiEventsDiscountsValidate(eventId, discountCode);
      setAppliedDiscount(discount);
      showNotification('Discount applied successfully!', 'success');
    } catch (err: any) {
      setAppliedDiscount(null);
      const errorData = getErrorMessage(err, 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    }
  };

  const calculateFinalTotal = () => {
    let total = getCartTotal();
    if (appliedDiscount) {
      if (appliedDiscount.discountPercent) {
        total -= total * (appliedDiscount.discountPercent / 100);
      } else if (appliedDiscount.discountAmount) {
        total -= appliedDiscount.discountAmount;
      }
      total = Math.max(0, total);
    }
    return total;
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);

    if (!user?.id) {
      showNotification('User not logged in or user ID not available.', 'error');
      setCheckoutLoading(false);
      return;
    }

    try {
      const orderItemsMap = new Map<string, { ticketTypeId: number; showtimeId?: number; quantity: number; price: number }>();

      cartItems.forEach(item => {
        const key = `${item.ticketTypeId}-${item.showtimeId || 0}`;
        if (!orderItemsMap.has(key)) {
          orderItemsMap.set(key, {
            ticketTypeId: item.ticketTypeId,
            showtimeId: item.showtimeId,
            quantity: 0,
            price: item.price,
          });
        }
        const currentItem = orderItemsMap.get(key)!;
        currentItem.quantity += item.quantity;
      });

      const orderItems: OrderItemRequest[] = Array.from(orderItemsMap.values()).map(item => ({
        ticketTypeId: item.ticketTypeId,
        showtimeId: item.showtimeId,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderRequest = {
        userId: user.id,
        eventId: cartItems[0].eventId,
        paymentMethod: paymentMethod,
        currency: 'USD',
        discountCode: appliedDiscount?.code || undefined,
        items: orderItems,
      };

      const orderResponse = await OrdersService.postApiOrders(orderRequest);

      if (orderResponse.id) {
        const paymentTransaction: any = await OrdersService.postApiOrdersInitiatePayment(orderResponse.id, paymentMethod);
        
        if (paymentTransaction.status === 'SUCCESS') {
          showNotification('Order placed successfully!', 'success');
          clearCart();
          navigate(`/orders/${orderResponse.id}`);
          return;
        }

        if (paymentTransaction.paymentUrl) {
          window.location.href = paymentTransaction.paymentUrl;
        } else {
          showNotification('Không thể lấy URL thanh toán. Vui lòng thử lại.', 'error');
        }
      }

    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Thanh toán thất bại. Vui lòng thử lại.');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      console.error("Checkout error:", err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography>Redirecting to cart...</Typography>
      </Container>
    );
  }

  const subTotal = getCartTotal();
  const finalTotal = calculateFinalTotal();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Checkout</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Summary</Typography>
              <List>
                {cartItems.map((item, index) => (
                  <ListItem key={`${item.ticketTypeId}-${index}`} divider={index !== cartItems.length - 1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="600">{item.eventName}</Typography>
                        <Typography variant="subtitle2" color="primary" sx={{ mt: 0.5 }}>
                          {item.ticketTypeName}
                        </Typography>
                        {item.showtimeName && (
                          <Typography variant="body2" color="secondary" sx={{ mt: 0.5 }}>
                            Showtime: {item.showtimeName}
                          </Typography>
                        )}
                        {item.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: '300px' }}>
                            {item.description}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          ${item.price.toFixed(2)} per ticket
                        </Typography>
                        {(item.startSale || item.endSale) && (
                          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                            {item.startSale && `Sale: ${new Date(item.startSale).toLocaleDateString()}`}
                            {item.startSale && item.endSale && ' - '}
                            {item.endSale && `${new Date(item.endSale).toLocaleDateString()}`}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            {item.quantity} x ${item.price.toFixed(2)}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="700">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Discount Code</Typography>
              {cartItems.length > 0 && (() => {
                const eventIds = [...new Set(cartItems.map(item => item.eventId))];
                const eventNames = [...new Set(cartItems.map(item => item.eventName))];
                return (
                  <>
                    {eventIds.length > 1 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Your cart has tickets from multiple events. Please checkout separately for each event to use discount codes.
                      </Alert>
                    )}
                    {eventIds.length === 1 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Discount code will be applied to: <strong>{eventNames[0]}</strong>
                      </Typography>
                    )}
                  </>
                );
              })()}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Enter discount code"
                  variant="outlined"
                  fullWidth
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 90DISC"
                />
                <Button variant="contained" onClick={handleApplyDiscount} disabled={checkoutLoading}>
                  Apply
                </Button>
              </Box>
              {appliedDiscount && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Discount "{appliedDiscount.code}" applied!
                  {appliedDiscount.discountPercent && ` (${appliedDiscount.discountPercent}% off)`}
                  {appliedDiscount.discountAmount && ` ($${appliedDiscount.discountAmount.toFixed(2)} off)`}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ position: 'sticky', top: '100px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Payment Information</Typography>
              <List>
                <ListItem sx={{ justifyContent: 'space-between' }}>
                  <Typography>Subtotal</Typography>
                  <Typography>${subTotal.toFixed(2)}</Typography>
                </ListItem>
                {appliedDiscount && (
                  <ListItem sx={{ justifyContent: 'space-between', color: 'success.main' }}>
                    <Typography>Discount</Typography>
                    <Typography>-${(subTotal - finalTotal).toFixed(2)}</Typography>
                  </ListItem>
                )}
                <ListItem sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary.main">${finalTotal.toFixed(2)}</Typography>
                </ListItem>
              </List>

              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Payment Method</Typography>
                <TextField
                  select
                  fullWidth
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="PayPal">PayPal</MenuItem>
                  <MenuItem value="VNPAY">VNPAY</MenuItem>
                </TextField>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                disabled={checkoutLoading || cartItems.length === 0}
              >
                {checkoutLoading ? <CircularProgress size={24} color="inherit" /> : 'Place Order & Pay'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
