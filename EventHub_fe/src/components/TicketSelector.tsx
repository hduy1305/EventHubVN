import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { EventsService } from '../api/services/EventsService';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';

interface TicketOption {
  id: number;
  code: string;
  name: string;
  price: number;
  quota?: number; // Total quota from backend
  purchaseLimit?: number;
  saleStart?: string;
  saleEnd?: string;
  description?: string;
  showtimes: ShowtimeInfo[];
}

interface ShowtimeInfo {
  showtimeId: number;
  showtimeCode: string;
  startTime: string;
  endTime: string;
  allocatedQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
}

interface TicketSelectorProps {
  eventId: number;
  onAddToCart: (ticketTypeCode: string, showtimeCode: string, quantity: number) => void;
}

// Helper: Parse ISO datetime string safely without timezone conversion
const parseISODate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date parsed:', dateString);
      return null;
    }
    return date;
  } catch (e) {
    console.error('Error parsing date:', dateString, e);
    return null;
  }
};

export const TicketSelector: React.FC<TicketSelectorProps> = ({ eventId, onAddToCart }) => {
  const [tickets, setTickets] = useState<TicketOption[]>([]);
  const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { showNotification } = useNotification();
  const { addToCart, getTotalQuantityForTicketType } = useCart();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await EventsService.getApiEventsTicketsWithShowtimes(eventId);
        if (!data || data.length === 0) {
          setTickets([]);
          return;
        }
        console.log('Tickets fetched:', data);
        console.log('First ticket:', data[0]); // Debug: log entire first ticket
        console.log('First ticket quota:', data[0]?.quota);
        console.log('First ticket purchaseLimit:', data[0]?.purchaseLimit);
        console.log('First ticket showtimes:', data[0]?.showtimes?.[0]); // Debug: check if soldQuantity exists
        data.forEach((ticket: TicketOption) => {
          ticket.showtimes?.forEach((st: ShowtimeInfo) => {
            console.log(`Showtime ${st.showtimeCode}: allocated=${st.allocatedQuantity}, sold=${st.soldQuantity}, reserved=${st.reservedQuantity}, available=${st.allocatedQuantity - (st.soldQuantity + st.reservedQuantity)}`);
          });
        });
        setTickets(data);
        
        // Initialize quantities
        const qtyMap: Record<string, Record<string, number>> = {};
        data.forEach((ticket: TicketOption) => {
          console.log('Ticket:', ticket.code, 'Purchase Limit:', ticket.purchaseLimit);
          if (!ticket.code || !ticket.showtimes) return;
          qtyMap[ticket.code] = {};
          ticket.showtimes.forEach((st: ShowtimeInfo) => {
            qtyMap[ticket.code][st.showtimeCode] = 1;
          });
        });
        setQuantities(qtyMap);
      } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error?.message || 'Failed to load ticket options';
        console.error('Error fetching tickets:', error);
        showNotification(errorMsg, 'error');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchTickets();
    }
  }, [eventId, showNotification]);

  const getAvailableQuantity = (showtime: ShowtimeInfo, ticket?: TicketOption) => {
    const showtimeAvailable = showtime.allocatedQuantity - (showtime.soldQuantity + showtime.reservedQuantity);
    // If quota is defined, available cannot exceed quota
    if (ticket?.quota !== undefined && ticket.quota !== null) {
      return Math.min(showtimeAvailable, ticket.quota);
    }
    return showtimeAvailable;
  };

  const isSaleActive = (ticket: TicketOption) => {
    const now = new Date();
    
    // If ticket has no sale period defined, check if it has saleStart/saleEnd from API
    // If API returns these fields, they MUST be respected
    const hasSalePeriod = ticket.saleStart || ticket.saleEnd;
    
    // If no sale period at all, always allow sale
    if (!hasSalePeriod) {
      return true;
    }
    
    // If sale period is defined, MUST validate it
    const saleStartDate = ticket.saleStart ? parseISODate(ticket.saleStart) : null;
    const saleEndDate = ticket.saleEnd ? parseISODate(ticket.saleEnd) : null;
    
    // If either date fails to parse but was provided, deny sale
    if ((ticket.saleStart && !saleStartDate) || (ticket.saleEnd && !saleEndDate)) {
      console.warn('Failed to parse sale dates', { saleStart: ticket.saleStart, saleEnd: ticket.saleEnd });
      return false; // Fail safe - don't allow if can't parse
    }
    
    // Check if now is within sale period
    if (saleStartDate && now < saleStartDate) {
      console.log('Sale not started yet', { ticketCode: ticket.code, now: now.toISOString(), saleStart: saleStartDate.toISOString() });
      return false; // Sale hasn't started yet
    }
    
    if (saleEndDate && now > saleEndDate) {
      console.log('Sale has ended', { ticketCode: ticket.code, now: now.toISOString(), saleEnd: saleEndDate.toISOString() });
      return false; // Sale has ended
    }
    
    console.log('Sale is active', { ticketCode: ticket.code, now: now.toISOString() });
    return true; // Sale is active
  };

  const getSaleStatus = (ticket: TicketOption) => {
    const now = new Date();
    const saleStartDate = parseISODate(ticket.saleStart);
    const saleEndDate = parseISODate(ticket.saleEnd);
    
    if (saleStartDate && now < saleStartDate) {
      return { status: 'upcoming', message: `Sale starts ${saleStartDate?.toLocaleString()}` };
    }
    if (saleEndDate && now > saleEndDate) {
      return { status: 'ended', message: 'Sale has ended' };
    }
    return { status: 'active', message: 'On sale' };
  };

  const handleAddToCart = (ticketCode: string, showtimeCode: string) => {
    console.log('=== handleAddToCart CALLED ===', { ticketCode, showtimeCode, timestamp: new Date().toISOString(), addingToCart });
    
    // Prevent double-click
    if (addingToCart) {
      console.log('Already adding to cart, ignoring...');
      return;
    }
    
    const quantity = quantities[ticketCode]?.[showtimeCode];
    const ticket = tickets.find(t => t.code === ticketCode);
    
    if (!ticket) {
      showNotification('Ticket not found', 'error');
      return;
    }

    // Recheck sale period - critical validation
    const saleActive = isSaleActive(ticket);
    console.log('Sale active check:', saleActive);
    
    if (!saleActive) {
      showNotification('This ticket is not currently on sale', 'error');
      return;
    }

    if (!quantity || quantity < 1) {
      showNotification('Please enter a valid quantity (minimum 1)', 'error');
      return;
    }

    const showtime = ticket.showtimes?.find(s => s.showtimeCode === showtimeCode);
    if (!showtime) {
      showNotification('Showtime not found', 'error');
      return;
    }

    const available = getAvailableQuantity(showtime, ticket);
    if (available <= 0) {
      showNotification('This showtime is sold out', 'error');
      return;
    }

    // Validate available quantity
    if (quantity > available) {
      showNotification(`Only ${available} ticket(s) available for this showtime`, 'error');
      return;
    }

    // Check existing quantity in cart for this ticket type
    const alreadyInCart = getTotalQuantityForTicketType(ticket.id);
    const totalAfterAdd = alreadyInCart + quantity;

    // Validate purchase limit (Max Qty per customer)
    if (ticket.purchaseLimit && totalAfterAdd > ticket.purchaseLimit) {
      showNotification(
        `Purchase limit is ${ticket.purchaseLimit} ticket(s). You already have ${alreadyInCart} in cart.`,
        'error'
      );
      return;
    }

    try {
      setAddingToCart(true);
      console.log('=== BEFORE addToCart ===', { ticketCode, showtimeCode, quantity });
      // Actually add to cart using useCart hook
      const result = addToCart(
        {
          ticketTypeId: ticket.id,
          ticketTypeName: ticket.name,
          price: ticket.price,
          eventId: eventId,
          eventName: '', // Will be fetched from event context or passed separately
          showtimeId: showtime.showtimeId, // Pass showtime ID for backend
          showtimeCode: showtimeCode,
          showtimeName: `${showtime.showtimeCode} - ${parseISODate(showtime.startTime)?.toLocaleString()}`,
          quota: ticket.quota, // Total quota from backend
          purchaseLimit: ticket.purchaseLimit,
          startSale: ticket.saleStart,
          endSale: ticket.saleEnd,
        },
        quantity
      );
      console.log('=== AFTER addToCart ===', { result });
      
      // Check if add to cart was successful
      if (!result.success) {
        showNotification(result.message || 'Failed to add to cart', 'error');
        return;
      }
      
      // Reset to 1 after adding
      setQuantities(prev => ({
        ...prev,
        [ticketCode]: {
          ...prev[ticketCode],
          [showtimeCode]: 1
        }
      }));
      showNotification(`Added ${quantity} ticket(s) to cart`, 'success');
      
      // Also call the callback if provided (for analytics, without extra notification)
      if (onAddToCart) {
        onAddToCart(ticketCode, showtimeCode, quantity);
      }
    } catch (error: any) {
      showNotification(error?.message || 'Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (tickets.length === 0) {
    return (
      <Alert severity="info">No tickets available for this event</Alert>
    );
  }

  return (
    <Box sx={{ gap: 3, display: 'grid', maxWidth: '1200px', width: '100%', mx: 'auto', px: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>Select Tickets</Typography>
      {tickets.map(ticket => {
        if (!ticket || !ticket.code) return null;
        
        const saleStatus = getSaleStatus(ticket);
        const isActive = isSaleActive(ticket);

        return (
          <Card key={ticket.code}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="h6">{ticket.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ticket.description}
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="primary">
                    ${ticket.price}
                  </Typography>
                </Box>

                {/* Sale Period Info */}
                {ticket.saleStart || ticket.saleEnd ? (
                  <Box sx={{ mb: 2, p: 1, bgcolor: '#fff3cd', borderRadius: 1 }}>
                    <Typography variant="caption" component="div">
                      <strong>Sale Period:</strong>
                    </Typography>
                    <Typography variant="caption">
                      {ticket.saleStart && `From ${parseISODate(ticket.saleStart)?.toLocaleString()}`}
                      {ticket.saleStart && ticket.saleEnd && ' to '}
                      {ticket.saleEnd && `Until ${parseISODate(ticket.saleEnd)?.toLocaleString()}`}
                    </Typography>
                  </Box>
                ) : null}

                {/* Sale Status Badge */}
                <Chip
                  label={saleStatus.message}
                  color={saleStatus.status === 'active' ? 'success' : saleStatus.status === 'upcoming' ? 'warning' : 'error'}
                  variant={isActive ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ mb: 2 }}
                />

                {/* Purchase Limit Info */}
                {ticket.purchaseLimit && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Max {ticket.purchaseLimit} per customer
                  </Typography>
                )}
              </Box>

              {/* Showtimes */}
              <Box sx={{ gap: 2, display: 'grid' }}>
                {!ticket.showtimes || ticket.showtimes.length === 0 ? (
                  <Alert severity="info">No showtimes available</Alert>
                ) : (
                  ticket.showtimes.map(showtime => {
                    if (!showtime || !showtime.showtimeCode) return null;
                    
                    const available = getAvailableQuantity(showtime, ticket);
                    const isSoldOut = available <= 0;
                    const isActive = isSaleActive(ticket);

                  return (
                    <Card
                      key={showtime.showtimeCode}
                      variant="outlined"
                      sx={{ bgcolor: isSoldOut ? '#f5f5f5' : 'background.paper' }}
                    >
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {showtime.showtimeCode}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {parseISODate(showtime.startTime)?.toLocaleString()} - {parseISODate(showtime.endTime)?.toLocaleTimeString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" display="block">
                              Available: {available} / {showtime.allocatedQuantity}
                            </Typography>
                            {isSoldOut && (
                              <Chip label="Sold Out" size="small" color="error" />
                            )}
                          </Grid>
                        </Grid>

                        {!isSoldOut && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              {(() => {
                                const currentQty = quantities[ticket.code]?.[showtime.showtimeCode] || 1;
                                const alreadyInCart = getTotalQuantityForTicketType(ticket.id);
                                const remainingPurchaseLimit = ticket.purchaseLimit 
                                  ? Math.max(0, ticket.purchaseLimit - alreadyInCart)
                                  : available;
                                const maxAllowed = Math.min(available, remainingPurchaseLimit);
                                const exceededPurchaseLimit = ticket.purchaseLimit && currentQty + alreadyInCart > ticket.purchaseLimit;
                                const exceededAvailable = currentQty > available;
                                const hasError = exceededPurchaseLimit || exceededAvailable;
                                
                                let helperTextMsg = '';
                                if (exceededPurchaseLimit) {
                                  helperTextMsg = `Limit: ${ticket.purchaseLimit}, In cart: ${alreadyInCart}, Can add: ${remainingPurchaseLimit}`;
                                } else if (exceededAvailable) {
                                  helperTextMsg = `Only ${available} available`;
                                } else {
                                  helperTextMsg = `Available: ${available}${ticket.purchaseLimit ? ` | In cart: ${alreadyInCart}/${ticket.purchaseLimit}` : ''}`;
                                }
                                
                                return (
                                  <TextField
                                    type="number"
                                    size="small"
                                    fullWidth
                                    inputProps={{ 
                                      min: 1, 
                                      max: maxAllowed
                                    }}
                                    value={currentQty}
                                    onChange={e => {
                                      let inputVal = parseInt(e.target.value);
                                      // Allow user to type the number, validate on blur
                                      if (isNaN(inputVal) || inputVal < 1) {
                                        inputVal = 1;
                                      }
                                      setQuantities(prev => ({
                                        ...prev,
                                        [ticket.code]: {
                                          ...prev[ticket.code],
                                          [showtime.showtimeCode]: inputVal
                                        }
                                      }));
                                    }}
                                    disabled={!isActive}
                                    helperText={helperTextMsg}
                                    error={hasError}
                                  />
                                );
                              })()}
                            </Box>
                            <Tooltip title={
                              isSoldOut ? 'Sold out' : !isActive ? 'Not on sale' : addingToCart ? 'Adding...' : ''
                            }>
                              <span>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<ShoppingCartIcon />}
                                  disabled={!isActive || isSoldOut || addingToCart}
                                  onClick={() => handleAddToCart(ticket.code, showtime.showtimeCode)}
                                >
                                  {addingToCart ? 'Adding...' : 'Add'}
                                </Button>
                              </span>
                            </Tooltip>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default TicketSelector;
