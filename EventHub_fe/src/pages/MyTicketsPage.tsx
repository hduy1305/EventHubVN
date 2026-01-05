import React, { useEffect, useState, useMemo } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, Alert, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Divider, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { TicketsService } from '../api/services/TicketsService';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';
import type { TicketResponse } from '../api/models/TicketResponse';
import { motion } from 'framer-motion';
import GetAppIcon from '@mui/icons-material/GetApp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const MyTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');

  // Dialog State for Transfer
  const [transferDialog, setTransferDialog] = useState<{ open: boolean; ticketCode?: string }>({ open: false });
  const [transferEmail, setTransferEmail] = useState<string>('');
  const [transferring, setTransferring] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id) {
      showNotification('User not authenticated.', 'error');
      setLoading(false);
      return;
    }
    fetchMyTickets();
  }, [user, showNotification]);

  const fetchMyTickets = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch all tickets for the user's events they attended
      const allTickets = await TicketsService.getApiTicketsUser(user.id);
      setTickets(allTickets || []);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải vé của bạn');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusColor = () => {
    return 'default';
  };

  const handleTransferTicket = async () => {
    if (!transferDialog.ticketCode || !transferEmail.trim()) {
      showNotification('Please enter recipient email.', 'warning');
      return;
    }
    setTransferring(true);
    try {
      // Call transfer API
      await TicketsService.postApiTicketsTransfer(transferDialog.ticketCode, transferEmail.trim(), user?.id || '');
      showNotification(`Ticket transferred to ${transferEmail} successfully!`, 'success');
      setTransferDialog({ open: false });
      setTransferEmail('');
      fetchMyTickets();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể chuyển vé');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setTransferring(false);
    }
  };

  const handleDownloadTicket = (ticket: TicketResponse) => {
    // Generate simple ticket PDF or download QR code
    const ticketData = `
Ticket Code: ${ticket.ticketCode}
Event: ${ticket.eventName}
Attendee: ${ticket.attendeeName}
Email: ${ticket.attendeeEmail}
Status: ${ticket.status}
    `;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(ticketData));
    element.setAttribute('download', `ticket-${ticket.ticketCode}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification('Ticket downloaded!', 'success');
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
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                    <Chip 
                      label={ticket.status} 
                      color={getStatusColor() as any} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Ticket Code: {ticket.ticketCode}</Typography>
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
                  
                  <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                  
                  {/* Quick Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GetAppIcon />}
                      onClick={() => handleDownloadTicket(ticket)}
                      fullWidth
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<CompareArrowsIcon />}
                      onClick={() => setTransferDialog({ open: true, ticketCode: ticket.ticketCode })}
                      fullWidth
                      disabled={ticket.status !== 'ISSUED'}
                    >
                      Transfer
                    </Button>
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

      {/* Transfer Dialog */}
      <Dialog open={transferDialog.open} onClose={() => setTransferDialog({ open: false })}>
        <DialogTitle>Transfer Ticket</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter the email of the person you want to transfer this ticket to.
          </Typography>
          <TextField
            fullWidth
            label="Recipient Email"
            placeholder="recipient@example.com"
            type="email"
            value={transferEmail}
            onChange={(e) => setTransferEmail(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialog({ open: false })}>Cancel</Button>
          <Button 
            onClick={handleTransferTicket} 
            variant="contained" 
            disabled={transferring || !transferEmail.trim()}
          >
            {transferring ? 'Transferring...' : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyTicketsPage;
