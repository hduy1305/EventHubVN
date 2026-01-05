import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, TextField, Chip, Box, List, ListItem, ListItemText, CircularProgress, Avatar, Divider, Stack, Paper } from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import type { Event } from '../api/models/Event';
import type { TicketType } from '../api/models/TicketType';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import PolicyIcon from '@mui/icons-material/Policy';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = id ? parseInt(id) : undefined;
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        showNotification('Invalid event ID.', 'error');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedEvent = await EventsService.getApiEvents1(eventId);
        setEvent(fetchedEvent);

        const fetchedTicketTypes = await EventsService.getApiEventsTicketTypes(eventId);
        setTicketTypes(fetchedTicketTypes);

        const initialQuantities: { [key: number]: number } = {};
        fetchedTicketTypes.forEach(type => {
          if (type.id !== undefined) initialQuantities[type.id] = 1;
        });
        setSelectedQuantities(initialQuantities);

      } catch (err: any) {
        showNotification(err.message || 'Failed to fetch event details.', 'error');
        console.error("Failed to fetch event details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, showNotification]);

  const handleQuantityChange = (ticketTypeId: number, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [ticketTypeId]: Math.max(1, quantity),
    }));
  };

  const handleAddToCart = (ticketType: TicketType) => {
    if (!event || !ticketType.id) return;

    const quantity = selectedQuantities[ticketType.id];
    if (!quantity || quantity <= 0) {
      showNotification('Please select a valid quantity.', 'warning');
      return;
    }

    addToCart(
      {
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name || '',
        price: ticketType.price || 0,
        eventId: event.id!,
        eventName: event.name!,
        quota: ticketType.quota,
        purchaseLimit: ticketType.purchaseLimit,
        startSale: ticketType.startSale,
        endSale: ticketType.endSale,
      },
      quantity
    );
    
    showNotification(`${quantity} x ${ticketType.name} added to cart!`, 'success');
    
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return <Container sx={{ mt: 5, textAlign: 'center' }}><Typography variant="h5">Event not found or an error occurred.</Typography></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card 
            component={motion.div} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            sx={{ 
              borderRadius: 3, 
              overflow: 'visible', // Allow avatar to overflow
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            {(event.bannerUrl || event.coverImage) && (
              <Box sx={{ position: 'relative', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="400"
                  image={event.bannerUrl || event.coverImage}
                  alt={event.name}
                  sx={{ objectFit: 'cover' }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '60%', 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                    pointerEvents: 'none'
                  }} 
                />
                {event.logoUrl && (
                  <Avatar 
                    src={event.logoUrl} 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      position: 'absolute', 
                      bottom: -40, 
                      left: 40, 
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 2
                    }} 
                  />
                )}
              </Box>
            )}
            <CardContent sx={{ pt: event.logoUrl ? 7 : 4, px: 5, pb: 5 }}>
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="overline" color="primary" fontWeight="800" sx={{ letterSpacing: 1.2, fontSize: '0.85rem' }}>
                  {event.category?.toUpperCase()}
                </Typography>
                <Chip 
                  label={event.status} 
                  color={event.status === 'PUBLISHED' ? 'success' : 'warning'} 
                  size="small" 
                  variant="filled" 
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              
              <Typography variant="h3" component="h1" fontWeight="800" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.1 }}>
                {event.name}
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} sx={{ mb: 4, mt: 3, color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Date</Typography>
                    <Typography variant="body2">{event.startTime ? new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Time</Typography>
                    <Typography variant="body2">
                      {event.startTime ? new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                {event.venue && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Location</Typography>
                      <Typography variant="body2">{event.venue.city}</Typography>
                    </Box>
                  </Box>
                )}
              </Stack>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h5" fontWeight="700" gutterBottom>About This Event</Typography>
              <Typography variant="body1" paragraph color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {event.description}
              </Typography>
              
              <Divider sx={{ my: 4 }} />

              <Grid container spacing={4}>
                {event.organizerInfo && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                      <BusinessIcon color="primary" /> Organizer
                    </Typography>
                    <Card variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
                      {event.organizerInfo.logoUrl && <Avatar src={event.organizerInfo.logoUrl} sx={{ width: 56, height: 56 }} />}
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{event.organizerInfo.organizerName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {event.organizerInfo.description}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                )}

                {event.venue && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                      <LocationOnIcon color="primary" /> Venue
                    </Typography>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">{event.venue.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {event.venue.address}, {event.venue.city}
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                  <PolicyIcon color="primary" /> Event Policies
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                  <Chip 
                    label={event.allowTicketTransfer ? "Transfer Allowed" : "No Transfers"} 
                    color={event.allowTicketTransfer ? "success" : "default"} 
                    variant="outlined" 
                    sx={{ borderRadius: 1 }}
                  />
                  <Chip 
                    label={event.refundEnabled ? `Refunds: Up to ${event.refundDeadlineHours}h before` : "No Refunds"} 
                    color={event.refundEnabled ? "success" : "error"} 
                    variant="outlined" 
                    sx={{ borderRadius: 1 }}
                  />
                  {event.refundEnabled && event.refundFeePercent !== undefined && (
                    <Chip label={`${(event.refundFeePercent * 100).toFixed(0)}% Fee`} size="small" variant="outlined" />
                  )}
                </Stack>
              </Box>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              mb: 3, 
              position: 'sticky', 
              top: 24, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }} 
            component={motion.div} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="800">Select Tickets</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose your tickets and quantity below.
              </Typography>
              
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ticketTypes.length > 0 ? (
                  ticketTypes.map((type) => (
                    <Paper 
                      key={type.id} 
                      elevation={0} 
                      variant="outlined"
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="700">{type.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }}>
                            Standard ticket
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary.main" fontWeight="700">${(type.price || 0).toFixed(2)}</Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                      {(type.startSale || type.endSale) && (
                        <Box sx={{ mb: 1.5, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                          <Typography variant="caption" color="warning.dark" sx={{ display: 'block', fontWeight: 600 }}>
                            📅 Sale Period:
                          </Typography>
                          <Typography variant="caption" color="warning.dark">
                            {type.startSale && `From ${new Date(type.startSale).toLocaleDateString()} ${new Date(type.startSale).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </Typography>
                          {type.startSale && <br />}
                          <Typography variant="caption" color="warning.dark">
                            {type.endSale && `Until ${new Date(type.endSale).toLocaleDateString()} ${new Date(type.endSale).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Chip 
                            label={(type.quota ?? 0) > 0 ? `${type.quota} left` : 'Sold Out'} 
                            color={(type.quota ?? 0) < 10 ? "warning" : "default"} 
                            size="small" 
                            variant="outlined"
                            sx={{ height: 24, fontSize: '0.75rem' }}
                         />
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              type="number"
                              size="small"
                              inputProps={{ min: 1, max: type.purchaseLimit, style: { padding: '4px 8px', textAlign: 'center' } }}
                              value={type.id !== undefined ? (selectedQuantities[type.id] || 1) : 1}
                              onChange={(e) => type.id !== undefined && handleQuantityChange(type.id, parseInt(e.target.value))}
                              sx={{ width: '60px', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleAddToCart(type)}
                              disabled={type.id === undefined || (selectedQuantities[type.id] || 0) <= 0 || (type.quota ?? 0) <= 0}
                              sx={{ minWidth: '64px', borderRadius: 1, boxShadow: 'none' }}
                            >
                              Add
                            </Button>
                         </Box>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <ListItem><ListItemText primary="No ticket types available." /></ListItem>
                )}
              </List>
            </CardContent>
          </Card>

        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetailPage;
