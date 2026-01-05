import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import type { Discount } from '../api/models/Discount';
import { Grid, TextField, Button, Paper, Divider, List, ListItem, ListItemText, Chip } from '@mui/material';
import type { Event } from '../api/models/Event';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';

const OrganizerEventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = id ? parseInt(id) : undefined;
  const { showNotification } = useNotification();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [creating, setCreating] = useState<boolean>(false);
  const [discountForm, setDiscountForm] = useState({
    code: '',
    discountPercent: '',
    discountAmount: '',
    usageLimit: '',
    validFrom: '',
    validTo: '',
    minimumOrderAmount: '',
  });

  useEffect(() => {
    const fetchEventAndDiscounts = async () => {
      if (!eventId) {
        showNotification('Invalid event ID.', 'error');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const fetchedEvent = await EventsService.getApiEvents1(eventId);
        setEvent(fetchedEvent);
        const fetchedDiscounts = await EventsService.getApiEventsDiscounts(eventId);
        setDiscounts(fetchedDiscounts);
      } catch (err: any) {
        const errorData = getErrorMessage(err, 'Không thể tải thông tin sự kiện. Vui lòng thử lại sau.');
        showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      } finally {
        setLoading(false);
      }
    };
    fetchEventAndDiscounts();
  }, [eventId, showNotification]);

  const handleDiscountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDiscountForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setCreating(true);
    try {
      const payload: Discount = {
        code: discountForm.code,
        discountPercent: discountForm.discountPercent ? Number(discountForm.discountPercent) : undefined,
        discountAmount: discountForm.discountAmount ? Number(discountForm.discountAmount) : undefined,
        usageLimit: discountForm.usageLimit ? Number(discountForm.usageLimit) : undefined,
        validFrom: discountForm.validFrom || undefined,
        validTo: discountForm.validTo || undefined,
        minimumOrderAmount: discountForm.minimumOrderAmount ? Number(discountForm.minimumOrderAmount) : undefined,
      };
      await EventsService.postApiEventsDiscounts(eventId, payload);
      showNotification('Discount code created successfully!', 'success');
      setDiscountForm({ code: '', discountPercent: '', discountAmount: '', usageLimit: '', validFrom: '', validTo: '', minimumOrderAmount: '' });
      // Refresh discount list
      const updatedDiscounts = await EventsService.getApiEventsDiscounts(eventId);
      setDiscounts(updatedDiscounts);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tạo mã giảm giá. Vui lòng thử lại sau.');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setCreating(false);
    }
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" color="error" gutterBottom>
              Event not found
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom color="primary.main">{event.name}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" color="secondary" gutterBottom>{event.category}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{event.description}</Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label={event.status} color={event.status === 'PUBLISHED' ? 'success' : event.status === 'CANCELLED' ? 'error' : 'warning'} sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary" display="inline">
                {event.startTime ? `Start: ${new Date(event.startTime).toLocaleString()}` : ''} {' '}
                {event.endTime ? `End: ${new Date(event.endTime).toLocaleString()}` : ''}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Venue: <strong>{event.venue?.name || 'N/A'}</strong> - {event.venue?.address || ''} {event.venue?.city || ''}
            </Typography>
            {event.coverImage && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <img src={event.coverImage} alt="Event Cover" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }} />
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom color="primary">Discount Codes</Typography>
            <form onSubmit={handleCreateDiscount} style={{ marginBottom: 24 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField label="Code" name="code" value={discountForm.code} onChange={handleDiscountInputChange} fullWidth required /></Grid>
                <Grid item xs={6}><TextField label="% Discount" name="discountPercent" value={discountForm.discountPercent} onChange={handleDiscountInputChange} type="number" fullWidth /></Grid>
                <Grid item xs={6}><TextField label="Amount Discount" name="discountAmount" value={discountForm.discountAmount} onChange={handleDiscountInputChange} type="number" fullWidth /></Grid>
                <Grid item xs={6}><TextField label="Usage Limit" name="usageLimit" value={discountForm.usageLimit} onChange={handleDiscountInputChange} type="number" fullWidth /></Grid>
                <Grid item xs={6}><TextField label="Min Order Amount" name="minimumOrderAmount" value={discountForm.minimumOrderAmount} onChange={handleDiscountInputChange} type="number" fullWidth /></Grid>
                <Grid item xs={6}><TextField label="Valid From" name="validFrom" value={discountForm.validFrom} onChange={handleDiscountInputChange} type="date" fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={6}><TextField label="Valid To" name="validTo" value={discountForm.validTo} onChange={handleDiscountInputChange} type="date" fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" disabled={creating} fullWidth>
                    {creating ? 'Creating...' : 'Create Discount'}
                  </Button>
                </Grid>
              </Grid>
            </form>
            <Divider sx={{ mb: 2 }} />
            <List>
              {discounts.length === 0 ? (
                <ListItem><ListItemText primary="No discount codes yet." /></ListItem>
              ) : (
                discounts.map(discount => (
                  <ListItem key={discount.id} divider>
                    <ListItemText
                      primary={<>
                        <strong>{discount.code}</strong> {discount.discountPercent ? `- ${discount.discountPercent}%` : ''} {discount.discountAmount ? `- $${discount.discountAmount}` : ''}
                      </>}
                      secondary={<>
                        Usage: {discount.usedCount || 0}/{discount.usageLimit || '∞'} | Min Order: ${discount.minimumOrderAmount || 0}<br />
                        Valid: {discount.validFrom ? new Date(discount.validFrom).toLocaleDateString() : 'N/A'} - {discount.validTo ? new Date(discount.validTo).toLocaleDateString() : 'N/A'}
                      </>}
                    />
                  </ListItem>
                ))
              )}
            </List>
            <Divider sx={{ mt: 2, mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              <strong>Instructions:</strong> Customers can enter a discount code during checkout to receive ticket discounts. If the code is valid, the system will automatically apply the corresponding discount amount.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrganizerEventDetailPage;
