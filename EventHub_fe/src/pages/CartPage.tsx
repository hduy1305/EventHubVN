import React from 'react';
import { Container, Grid, Card, CardContent, Button, List, ListItem, Typography, TextField, IconButton, Box } from '@mui/material';
import { useCart } from '../context/CartContext';
import { Link as RouterLink } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { showNotification } = useNotification();

  const handleUpdateQuantity = (ticketTypeId: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newQuantity = parseInt(event.target.value);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      updateQuantity(ticketTypeId, newQuantity);
      showNotification('Cart item quantity updated.', 'info', 1000);
    }
  };

  const handleRemoveItem = (ticketTypeId: number) => {
    removeFromCart(ticketTypeId);
    showNotification('Item removed from cart.', 'info', 1000);
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Your cart is empty.</Typography>
        <Button component={RouterLink} to="/events" variant="contained">Browse Events</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Your Shopping Cart</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card elevation={0} variant="outlined">
            <List>
              {cartItems.map((item, index) => (
                <ListItem
                  key={`${item.ticketTypeId}-${index}`}
                  divider={index !== cartItems.length - 1}
                  sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 2, py: 2 }}
                  component={motion.div}
                  layout
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{item.eventName}</Typography>
                    <Typography variant="subtitle2" fontWeight="600" sx={{ mt: 0.5, mb: 0.5 }}>
                      {item.ticketTypeName}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, maxWidth: '400px' }}>
                        {item.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      ${item.price.toFixed(2)} per ticket
                    </Typography>
                    {(item.startSale || item.endSale) && (
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                        {item.startSale && `Sale starts: ${new Date(item.startSale).toLocaleDateString()}`}
                        {item.startSale && item.endSale && ' • '}
                        {item.endSale && `Sale ends: ${new Date(item.endSale).toLocaleDateString()}`}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      type="number"
                      label="Qty"
                      size="small"
                      inputProps={{ min: 0 }}
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.ticketTypeId, e)}
                      sx={{ width: '80px' }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: '80px', textAlign: 'right' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton color="error" onClick={() => handleRemoveItem(item.ticketTypeId)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Card>
          <Button variant="outlined" color="warning" onClick={() => { clearCart(); showNotification('Cart cleared.', 'info'); }} sx={{ mt: 2 }}>
            Clear Cart
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: '100px' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Total Items:</Typography>
                <Typography>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary.main">${getCartTotal().toFixed(2)}</Typography>
              </Box>
              <Button component={RouterLink} to="/checkout" variant="contained" fullWidth size="large">
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
