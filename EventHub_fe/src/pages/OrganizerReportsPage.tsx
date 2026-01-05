import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, CircularProgress, TextField, MenuItem, Alert, Button } from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import { ReportingService } from '../api/services/ReportingService';
import type { Event } from '../api/models/Event';
import { EventStatus } from '../api/models/EventStatus';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const OrganizerReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState<boolean>(true);

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [eventRevenue, setEventRevenue] = useState<number | null>(null);
  const [totalTicketsSold, setTotalTicketsSold] = useState<number | null>(null);
  const [eventTicketsSold, setEventTicketsSold] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ name: string; revenue: number }[]>([]);
  const [dailySales, setDailySales] = useState<{ date: string; count: number }[]>([]);
  const [salesStartDate, setSalesStartDate] = useState<string>('');
  const [salesEndDate, setSalesEndDate] = useState<string>('');
  const [salesLoading, setSalesLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      showNotification('User not authenticated.', 'error');
      setLoading(false);
      return;
    }
    fetchOrganizerEvents();
  }, [user, showNotification]);

  useEffect(() => {
    fetchReports();
  }, [events, selectedEventId, showNotification]);

  useEffect(() => {
    if (!selectedEventId) {
      setSalesStartDate('');
      setSalesEndDate('');
      setDailySales([]);
      return;
    }
    const event = events.find(e => e.id === parseInt(selectedEventId));
    if (!event) {
      return;
    }
    const publishedDate = resolvePublishedDate(event);
    const endDate = resolveDefaultEndDate(event, publishedDate);
    setSalesStartDate(publishedDate);
    setSalesEndDate(endDate && endDate >= publishedDate ? endDate : publishedDate);
  }, [events, selectedEventId]);

  const fetchOrganizerEvents = async () => {
    setLoading(true);
    try {
      const response = await EventsService.getApiEventsSearch(undefined, undefined, undefined, undefined, undefined, undefined, EventStatus.PUBLISHED);
      const allEvents = response.content || [];
      const organizerManagedEvents = allEvents.filter(event => event.organizerId === user?.id);
      setEvents(organizerManagedEvents);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải danh sách sự kiện. Vui lòng thử lại sau.');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      console.error("Failed to fetch organizer events:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    if (events.length === 0) {
      if (!loading) {
        showNotification('No events available to generate reports.', 'info');
      }
      setTotalRevenue(null);
      setEventRevenue(null);
      setTotalTicketsSold(null);
      setEventTicketsSold(null);
      setChartData([]);
      return;
    }

    try {
      let calculatedTotalRevenue = 0;
      let calculatedTotalTicketsSold = 0;
      const newChartData: { name: string; revenue: number }[] = [];

      const eventsToReport = events.filter(event => event.organizerId === user?.id);

      for (const event of eventsToReport) {
        const revenue = await ReportingService.getApiReportsRevenueEvent(event.id!);
        calculatedTotalRevenue += revenue;
        const ticketsSold = await ReportingService.getApiReportsTicketsEventSold(event.id!);
        calculatedTotalTicketsSold += ticketsSold;
        newChartData.push({ name: event.name!, revenue });
      }
      setTotalRevenue(calculatedTotalRevenue);
      setTotalTicketsSold(calculatedTotalTicketsSold);
      setChartData(newChartData);

      if (selectedEventId) {
        const parsedEventId = parseInt(selectedEventId);
        const revenue = await ReportingService.getApiReportsRevenueEvent(parsedEventId);
        setEventRevenue(revenue);
        const ticketsSold = await ReportingService.getApiReportsTicketsEventSold(parsedEventId);
        setEventTicketsSold(ticketsSold);
      } else {
        setEventRevenue(null);
        setEventTicketsSold(null);
      }
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải báo cáo');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      console.error("Failed to fetch reports:", err);
    } finally {
      // Optional: Set loading to false if this was the only loading indicator
    }
  };

  const handleEventSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEventId(e.target.value);
  };

  const resolvePublishedDate = (event: Event) => {
    const date = event.updatedAt || event.createdAt || event.startTime || '';
    return date ? new Date(date).toISOString().slice(0, 10) : '';
  };

  const resolveDefaultEndDate = (event: Event, fallback: string) => {
    const date = event.startTime || '';
    const end = date ? new Date(date).toISOString().slice(0, 10) : '';
    if (!end && fallback) {
      return fallback;
    }
    return end || new Date().toISOString().slice(0, 10);
  };

  const fetchDailySales = async () => {
    if (!selectedEventId) {
      showNotification('Select an event to view daily sales.', 'info');
      return;
    }
    if (!salesStartDate || !salesEndDate) {
      showNotification('Select a valid date range.', 'error');
      return;
    }
    if (salesEndDate < salesStartDate) {
      showNotification('End date must be on or after the start date.', 'error');
      return;
    }
    setSalesLoading(true);
    try {
      const data = await ReportingService.getApiStatsEventsDailySales(
        parseInt(selectedEventId),
        salesStartDate,
        salesEndDate
      );
      setDailySales(data);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải báo cáo banhngày');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      console.error("Failed to fetch daily sales:", err);
    } finally {
      setSalesLoading(false);
    }
  };

  const formatChartDate = (value: string) => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
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
      <Typography variant="h4" gutterBottom fontWeight={700}>Reports & Analytics</Typography>
      
      <Card sx={{ mb: 4, p: 2 }}>
        <TextField
          select
          label="View Reports For"
          fullWidth
          value={selectedEventId}
          onChange={handleEventSelectChange}
        >
          <MenuItem value="">All My Events</MenuItem>
          {events.map(event => (
            <MenuItem key={event.id} value={event.id}>{event.name}</MenuItem>
          ))}
        </TextField>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyIcon sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h6">Total Revenue (All Events)</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                ${totalRevenue !== null ? totalRevenue.toFixed(2) : '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ConfirmationNumberIcon sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h6">Total Tickets Sold (All Events)</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {totalTicketsSold !== null ? totalTicketsSold : '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {selectedEventId && (
          <>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Revenue for {events.find(e => e.id === parseInt(selectedEventId))?.name}
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    ${eventRevenue !== null ? eventRevenue.toFixed(2) : '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Tickets Sold for {events.find(e => e.id === parseInt(selectedEventId))?.name}
                  </Typography>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    {eventTicketsSold !== null ? eventTicketsSold : '0'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {selectedEventId && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Daily Ticket Sales</Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, alignItems: 'center', mb: 2 }}>
              <TextField
                label="From Date"
                value={salesStartDate}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="To Date"
                type="date"
                value={salesEndDate}
                onChange={e => setSalesEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" onClick={fetchDailySales} disabled={salesLoading}>
                Filter
              </Button>
            </Box>
            {dailySales.length === 0 ? (
              <Alert severity="info">No daily sales data to display.</Alert>
            ) : (
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={dailySales}>
                    <XAxis dataKey="date" tickFormatter={formatChartDate} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={formatChartDate} />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Revenue by Event</Typography>
          {chartData.length === 0 ? (
            <Alert severity="info">No data to display yet.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {chartData.map((row) => {
                const max = Math.max(...chartData.map(c => c.revenue || 0), 1);
                const width = Math.max(8, Math.min(100, (row.revenue / max) * 100));
                return (
                  <Box key={row.name}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>{row.name} — {row.revenue}</Typography>
                    <Box sx={{ height: 10, bgcolor: 'grey.200', borderRadius: 8 }}>
                      <Box sx={{ width: `${width}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 8 }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrganizerReportsPage;
