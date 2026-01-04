import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Card, CardContent, Typography, List, ListItem, IconButton, Box, MenuItem, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import type { Seat } from '../api/models/Seat';
import type { TicketType } from '../api/models/TicketType';
import { useNotification } from '../context/NotificationContext';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface SeatManagementProps {
  eventId: number | undefined;
}

const SeatManagement: React.FC<SeatManagementProps> = ({ eventId }) => {
  const { showNotification } = useNotification();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [newSeat, setNewSeat] = useState<Partial<Seat>>({
    section: '',
    rowLabel: '',
    seatNumber: '',
    seatCategory: '',
    isAvailable: true,
    locked: false,
    ticketType: undefined,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [editingSeatId, setEditingSeatId] = useState<number | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchSeatsAndTicketTypes();
    } else {
      setSeats([]);
    }
  }, [eventId]);

  const fetchSeatsAndTicketTypes = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const fetchedSeats = await EventsService.getApiEventsSeats(eventId);
      setSeats(fetchedSeats);

      const fetchedTicketTypes = await EventsService.getApiEventsTicketTypes(eventId);
      setTicketTypes(fetchedTicketTypes);

    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to fetch seats or ticket types.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSeat(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewSeat(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleTicketTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ticketTypeId = parseInt(e.target.value);
    const selectedType = ticketTypes.find(tt => tt.id === ticketTypeId);
    setNewSeat(prev => ({
      ...prev,
      ticketType: selectedType,
    }));
  };

  const handleAddSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) {
      showNotification('Please create the event first before adding seats.', 'warning');
      return;
    }
    setLoading(true);
    try {
      if (editingSeatId) {
        await EventsService.putApiEventsSeatsAvailability(editingSeatId, newSeat.isAvailable || false);
        showNotification('Seat availability updated successfully!', 'success');
      } else {
        const seatToAdd = {
          ...newSeat,
          id: undefined,
          eventId: eventId,
          ticketTypeId: newSeat.ticketType?.id,
        } as Seat;
        await EventsService.postApiEventsSeats(eventId, [seatToAdd]);
        showNotification('Seat added successfully!', 'success');
      }
      setNewSeat({ section: '', rowLabel: '', seatNumber: '', seatCategory: '', isAvailable: true, locked: false, ticketType: undefined });
      fetchSeatsAndTicketTypes();
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to save seat.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (seat: Seat) => {
    setEditingSeatId(seat.id || null);
    setNewSeat({
      section: seat.section,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      seatCategory: seat.seatCategory,
      isAvailable: seat.isAvailable,
      locked: seat.locked,
      ticketType: seat.ticketType,
    });
  };

  const handleDeleteSeat = async (seatId: number) => {
    if (!window.confirm('Are you sure you want to delete this seat?')) {
      return;
    }
    setLoading(true);
    try {
      await EventsService.putApiEventsSeatsAvailability(seatId, false);
      showNotification('Seat marked as unavailable successfully (simulated delete)!', 'success');
      fetchSeatsAndTicketTypes();
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to delete seat.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Seat Management</Typography>
        
        <Box component="form" onSubmit={handleAddSeat} sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid component="div" xs={12} sm={3}>
              <TextField label="Section" name="section" fullWidth required value={newSeat.section || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={3}>
              <TextField label="Row" name="rowLabel" fullWidth required value={newSeat.rowLabel || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={3}>
              <TextField label="Number" name="seatNumber" fullWidth required value={newSeat.seatNumber || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={3}>
              <TextField label="Category" name="seatCategory" fullWidth value={newSeat.seatCategory || ''} onChange={handleChange} />
            </Grid>
            <Grid component="div" xs={12} sm={6}>
              <TextField
                select
                label="Ticket Type"
                fullWidth
                value={newSeat.ticketType?.id || ''}
                onChange={handleTicketTypeChange}
                required
              >
                <MenuItem value="">Select Type</MenuItem>
                {ticketTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>{type.name} (${type.price})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid component="div" xs={12} sm={6}>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={newSeat.isAvailable || false} onChange={handleCheckboxChange} name="isAvailable" />}
                  label="Available"
                />
                <FormControlLabel
                  control={<Checkbox checked={newSeat.locked || false} onChange={handleCheckboxChange} name="locked" />}
                  label="Locked"
                />
              </FormGroup>
            </Grid>
            <Grid component="div" xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" disabled={loading || !eventId}>
                  {editingSeatId ? 'Update' : 'Add'}
                </Button>
                {editingSeatId && (
                  <Button variant="outlined" onClick={() => {
                    setEditingSeatId(null);
                    setNewSeat({ section: '', rowLabel: '', seatNumber: '', seatCategory: '', isAvailable: true, locked: false, ticketType: undefined });
                  }}>Cancel</Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <List>
          {seats.map((seat) => (
            <ListItem
              key={seat.id}
              divider
              secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(seat)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDeleteSeat(seat.id!)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <Box>
                <Typography variant="subtitle1">{seat.section}-{seat.rowLabel}-{seat.seatNumber} ({seat.seatCategory})</Typography>
                <Typography variant="body2" color="text.secondary">
                  {seat.ticketType ? `Type: ${seat.ticketType.name}` : 'No Type'} | 
                  Available: {seat.isAvailable ? 'Yes' : 'No'} | Locked: {seat.locked ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </ListItem>
          ))}
          {seats.length === 0 && <Typography color="text.secondary">No seats defined yet.</Typography>}
        </List>
      </CardContent>
    </Card>
  );
};

export default SeatManagement;
