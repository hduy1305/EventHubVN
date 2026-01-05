import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Card, CardContent, Typography, List, ListItem, IconButton, Box } from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import type { Discount } from '../api/models/Discount';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface DiscountManagementProps {
  eventId: number | undefined;
}

const DiscountManagement: React.FC<DiscountManagementProps> = ({ eventId }) => {
  const { showNotification } = useNotification();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    code: '',
    discountPercent: 0,
    discountAmount: 0,
    minimumOrderAmount: 0,
    usageLimit: 0,
    validFrom: '',
    validTo: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [editingDiscountId, setEditingDiscountId] = useState<number | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchDiscounts();
    } else {
      setDiscounts([]);
    }
  }, [eventId]);

  const fetchDiscounts = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const fetchedDiscounts = await EventsService.getApiEventsDiscounts(eventId);
      setDiscounts(fetchedDiscounts);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải danh sách mã giảm giá');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewDiscount(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) {
      showNotification('Please create the event first before adding discount codes.', 'warning');
      return;
    }
    setLoading(true);
    try {
      if (editingDiscountId) {
        showNotification('Updating discount codes is not yet supported by the API.', 'warning');
      } else {
        await EventsService.postApiEventsDiscounts(eventId, { ...newDiscount, event: { id: eventId } } as Discount);
        showNotification('Discount code added successfully!', 'success');
      }
      setEditingDiscountId(null);
      setNewDiscount({ code: '', discountPercent: 0, discountAmount: 0, minimumOrderAmount: 0, usageLimit: 0, validFrom: '', validTo: '' });
      fetchDiscounts();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể lưu mã giảm giá');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (discount: Discount) => {
    setEditingDiscountId(discount.id || null);
    setNewDiscount({
      code: discount.code,
      discountPercent: discount.discountPercent,
      discountAmount: discount.discountAmount,
      minimumOrderAmount: discount.minimumOrderAmount,
      usageLimit: discount.usageLimit,
      validFrom: discount.validFrom ? new Date(discount.validFrom).toISOString().slice(0, 16) : '',
      validTo: discount.validTo ? new Date(discount.validTo).toISOString().slice(0, 16) : '',
    });
  };

  const handleDeleteDiscount = async (discountId: number) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) {
      return;
    }
    setLoading(true);
    try {
      await EventsService.deleteApiEventsDiscounts(discountId);
      showNotification('Discount code deleted successfully!', 'success');
      fetchDiscounts();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể xóa mã giảm giá');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Discount Codes</Typography>
        
        <Box component="form" onSubmit={handleAddDiscount} sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid component="div" xs={12} sm={4}>
              <TextField label="Code" name="code" fullWidth required value={newDiscount.code || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={4}>
              <TextField label="Percent (%)" name="discountPercent" type="number" fullWidth inputProps={{ min: 0, max: 100 }} value={newDiscount.discountPercent || 0} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={4}>
              <TextField label="Amount ($)" name="discountAmount" type="number" fullWidth inputProps={{ min: 0, step: 0.01 }} value={newDiscount.discountAmount || 0} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={4}>
              <TextField label="Min Order ($)" name="minimumOrderAmount" type="number" fullWidth inputProps={{ min: 0, step: 0.01 }} value={newDiscount.minimumOrderAmount || 0} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={4}>
              <TextField label="Usage Limit" name="usageLimit" type="number" fullWidth inputProps={{ min: 0 }} value={newDiscount.usageLimit || 0} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={6}>
              <TextField label="Valid From" name="validFrom" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={newDiscount.validFrom || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={6}>
              <TextField label="Valid To" name="validTo" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={newDiscount.validTo || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" disabled={loading || !eventId}>
                  {editingDiscountId ? 'Update' : 'Add'}
                </Button>
                {editingDiscountId && (
                  <Button variant="outlined" onClick={() => {
                    setEditingDiscountId(null);
                    setNewDiscount({ code: '', discountPercent: 0, discountAmount: 0, minimumOrderAmount: 0, usageLimit: 0, validFrom: '', validTo: '' });
                  }}>Cancel</Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <List>
          {discounts.map((discount) => (
            <ListItem
              key={discount.id}
              divider
              secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(discount)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDeleteDiscount(discount.id!)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <Box>
                <Typography variant="subtitle1">
                  {discount.code} - 
                  {discount.discountPercent ? ` ${discount.discountPercent}% OFF` : ''}
                  {discount.discountAmount ? ` $${discount.discountAmount.toFixed(2)} OFF` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usage: {discount.usedCount}/{discount.usageLimit || '∞'} | 
                  Valid: {discount.validFrom ? new Date(discount.validFrom).toLocaleDateString() : 'N/A'} - {discount.validTo ? new Date(discount.validTo).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </ListItem>
          ))}
          {discounts.length === 0 && <Typography color="text.secondary">No discount codes defined yet.</Typography>}
        </List>
      </CardContent>
    </Card>
  );
};

export default DiscountManagement;
