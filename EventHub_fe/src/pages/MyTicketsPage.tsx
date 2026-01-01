import React, { useEffect, useState, useMemo } from 'react';
import { Container, Typography, CircularProgress, Grid, Card, CardContent, Box, Alert, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { TicketsService } from '../api/services/TicketsService';
import type { TicketResponse } from '../api/models/TicketResponse';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';

const MyTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');

  useEffect(() => {
    const fetchMyTickets = async () => {
// ... fetch logic remains the same ...
    };
// ... rest remains same ...
  }, [user, showNotification]);

  // Derive unique categories and events for filters
  const uniqueCategories = useMemo(() => {
    const cats = new Set(tickets.map(t => t.eventCategory).filter(Boolean));
    return Array.from(cats).sort();
  }, [tickets]);

  const uniqueEvents = useMemo(() => {
    const evts = new Set(tickets.map(t => t.eventName).filter(Boolean));
    return Array.from(evts).sort();
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || ticket.eventCategory === categoryFilter;
      const matchesEvent = eventFilter === 'ALL' || ticket.eventName === eventFilter;
      
      const searchLower = keyword.toLowerCase();
      const matchesKeyword = 
        (ticket.ticketCode && ticket.ticketCode.toLowerCase().includes(searchLower)) ||
        (ticket.attendeeName && ticket.attendeeName.toLowerCase().includes(searchLower)) ||
        (ticket.eventName && ticket.eventName.toLowerCase().includes(searchLower));
      
      return matchesStatus && matchesCategory && matchesEvent && matchesKeyword;
    });
  }, [tickets, statusFilter, categoryFilter, eventFilter, keyword]);

  const getStatusColor = (status?: string) => {
// ... color logic ...
  };

  if (loading) {
// ... loading ...
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          My Tickets
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search keyword"
            placeholder="Code, Name, Event..."
            variant="outlined"
            size="small"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ minWidth: 200, flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="ISSUED">Issued</MenuItem>
              <MenuItem value="SCANNED">Scanned</MenuItem>
              <MenuItem value="REFUNDED">Refunded</MenuItem>
              <MenuItem value="TRANSFERRED">Transferred</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {uniqueCategories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Event</InputLabel>
            <Select
              value={eventFilter}
              label="Event"
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Events</MenuItem>
              {uniqueEvents.map(evt => (
                <MenuItem key={evt} value={evt}>{evt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {filteredTickets.length > 0 ? (
        <Grid container spacing={3}>
          {filteredTickets.map((ticket, index) => (
            <Grid item xs={12} sm={6} md={4} key={ticket.id}>
              <Card 
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}
              >
                <CardContent sx={{ textAlign: 'center', flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={ticket.eventCategory || 'Event'} 
                      size="small" 
                      color="primary" 
                      variant="soft" // If soft fails, it defaults to filled
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                    <Chip 
                      label={ticket.status} 
                      color={getStatusColor(ticket.status) as any} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                    {qrCodes[ticket.ticketCode || 'N/A'] ? (
                      <Box
                        component="img"
                        src={qrCodes[ticket.ticketCode || 'N/A']}
                        alt="Ticket QR"
                        sx={{ width: 160, height: 160, border: '1px solid', borderColor: 'divider', p: 1, borderRadius: 1 }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">QR unavailable</Typography>
                    )}
                  </Box>
                  
                  <Typography variant="h6" component="div" sx={{ mb: 0.5, fontWeight: '800', lineHeight: 1.2 }}>
                    {ticket.eventName || 'Unnamed Event'}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                    {ticket.ticketCode}
                  </Typography>
                  
                  <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                  
                  <Box sx={{ textAlign: 'left' }}>
                    {ticket.seatLabel && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Seat</Typography>
                        <Typography variant="caption" fontWeight="bold">{ticket.seatLabel}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Attendee</Typography>
                      <Typography variant="caption" fontWeight="bold">{ticket.attendeeName}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
          {tickets.length === 0 ? "You don't have any tickets yet." : "No tickets match your filters."}
        </Alert>
      )}
    </Container>
  );
};

export default MyTicketsPage;
