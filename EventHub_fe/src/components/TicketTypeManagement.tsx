import React, { useState, useEffect } from 'react';
import { TextField, Button, Card, CardContent, Typography, List, ListItem, IconButton, Box } from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import type { TicketType } from '../api/models/TicketType';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';

interface TicketTypeManagementProps {
  eventId: number | undefined;
}

const TicketTypeManagement: React.FC<TicketTypeManagementProps> = ({ eventId }) => {
  const { showNotification } = useNotification();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [newTicketType, setNewTicketType] = useState<Partial<TicketType>>({
    name: '',
    price: 0,
    quota: 0,
    purchaseLimit: 1,
    startSale: '',
    endSale: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [editingTicketTypeId, setEditingTicketTypeId] = useState<number | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchTicketTypes();
    } else {
      setTicketTypes([]);
    }
  }, [eventId]);

  const fetchTicketTypes = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const fetchedTypes = await EventsService.getApiEventsTicketTypes(eventId);
      setTicketTypes(fetchedTypes);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải các loại vé. Vui lòng thử lại sau.');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewTicketType(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleAddTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) {
      showNotification('Please create the event first before adding ticket types.', 'warning');
      return;
    }
    setLoading(true);
    try {
      if (editingTicketTypeId) {
        await EventsService.postApiEventsTicketTypes(editingTicketTypeId, { ...newTicketType, eventId: eventId } as TicketType);
        setEditingTicketTypeId(null);
        showNotification('Ticket type updated successfully!', 'success');
      } else {
        await EventsService.postApiEventsTicketTypes(eventId, { ...newTicketType, eventId: eventId } as TicketType);
        showNotification('Ticket type added successfully!', 'success');
      }
      setNewTicketType({ name: '', price: 0, quota: 0, purchaseLimit: 1, startSale: '', endSale: '' });
      fetchTicketTypes();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể lưu loại vé. Vui lòng thử lại sau.');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (ticketType: TicketType) => {
    setEditingTicketTypeId(ticketType.id || null);
    setNewTicketType({
      name: ticketType.name,
      price: ticketType.price,
      quota: ticketType.quota,
      purchaseLimit: ticketType.purchaseLimit,
      startSale: ticketType.startSale ? new Date(ticketType.startSale).toISOString().slice(0, 16) : '',
      endSale: ticketType.endSale ? new Date(ticketType.endSale).toISOString().slice(0, 16) : '',
    });
  };

  const handleDeleteTicketType = async (ticketTypeId: number) => {
    if (!window.confirm('Are you sure you want to delete this ticket type?')) {
      return;
    }
    setLoading(true);
    try {
      await EventsService.deleteApiEventsTicketTypes(ticketTypeId);
      showNotification('Ticket type deleted successfully!', 'success');
      fetchTicketTypes();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể xóa loại vé. Vui lòng thử lại sau.');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Ticket Types</Typography>
        
        <Box component="form" onSubmit={handleAddTicketType} sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid component="div" xs={12} sm={6}>
              <TextField label="Name" name="name" fullWidth required value={newTicketType.name || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={6}>
              <TextField label="Price" name="price" type="number" fullWidth required inputProps={{ min: 0, step: 0.01 }} value={newTicketType.price || 0} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={6}>
              <TextField label="Quota" name="quota" type="number" fullWidth required inputProps={{ min: 0 }} value={newTicketType.quota || 0} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={6}>
              <TextField label="Purchase Limit" name="purchaseLimit" type="number" fullWidth required inputProps={{ min: 1 }} value={newTicketType.purchaseLimit || 1} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={6}>
              <TextField label="Sale Start" name="startSale" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={newTicketType.startSale || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={6}>
              <TextField label="Sale End" name="endSale" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={newTicketType.endSale || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" disabled={loading || !eventId}>
                  {editingTicketTypeId ? 'Update' : 'Add'}
                </Button>
                {editingTicketTypeId && (
                  <Button variant="outlined" onClick={() => {
                    setEditingTicketTypeId(null);
                    setNewTicketType({ name: '', price: 0, quota: 0, purchaseLimit: 1, startSale: '', endSale: '' });
                  }}>Cancel</Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <List>
          {ticketTypes.map((type) => (
            <ListItem
              key={type.id}
              divider
              secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(type)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDeleteTicketType(type.id!)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <Box>
                <Typography variant="subtitle1">{type.name} - ${(type.price || 0).toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Quota: {type.quota} | Limit: {type.purchaseLimit}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sale: {type.startSale ? new Date(type.startSale).toLocaleDateString() : 'N/A'} - {type.endSale ? new Date(type.endSale).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </ListItem>
          ))}
          {ticketTypes.length === 0 && <Typography color="text.secondary">No ticket types defined yet.</Typography>}
        </List>
      </CardContent>
    </Card>
  );
};

export default TicketTypeManagement;
