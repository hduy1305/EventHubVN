import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  List,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Chip,
  
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { EventsService } from '../api/services/EventsService';
import { useNotification } from '../context/NotificationContext';
import type { TicketType } from '../api/models/TicketType';
import type { Discount } from '../api/models/Discount';

interface TicketTypeBuilderProps {
  eventId: number | undefined;
  eventStartTime?: string;
  discounts?: Discount[];
}

interface TicketTypeForm {
  name: string;
  price: number;
  quantity: number; // UI uses 'quantity' but will map to API 'quota'
  saleStartTime: string;
  saleEndTime: string;
  description?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const TicketTypeBuilder: React.FC<TicketTypeBuilderProps> = ({
  eventId,
  eventStartTime,
  discounts = [],
}) => {
  const { showNotification } = useNotification();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TicketTypeForm>({
    name: '',
    price: 0,
    quantity: 0,
    saleStartTime: new Date().toISOString().slice(0, 16),
    saleEndTime: eventStartTime ? new Date(eventStartTime).toISOString().slice(0, 16) : '',
    description: '',
  });
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  
  const [applicableDiscounts, setApplicableDiscounts] = useState<Discount[]>([]);

  useEffect(() => {
    if (eventId) {
      fetchTicketTypes();
    }
  }, [eventId]);

  useEffect(() => {
    validateForm();
  }, [form, eventStartTime]);

  const fetchTicketTypes = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const types = await EventsService.getApiEventsTicketTypes(eventId);
      setTicketTypes(types);
    } catch (err: any) {
      showNotification('Failed to fetch ticket types', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!form.name.trim()) errors.push('Ticket type name is required');
    if (form.price < 0) errors.push('Price cannot be negative');
    if (form.quantity < 1) errors.push('Quantity must be at least 1');

    // Date validations
    const saleStart = new Date(form.saleStartTime);
    const saleEnd = new Date(form.saleEndTime);
    const now = new Date();

    if (saleStart <= now) {
      warnings.push('Sale start time is in the past');
    }

    if (saleEnd <= saleStart) {
      errors.push('Sale end time must be after sale start time');
    }

    if (eventStartTime) {
      const eventStart = new Date(eventStartTime);
      if (saleEnd > eventStart) {
        errors.push('Sale must end before event starts');
      }
      if (saleStart >= eventStart) {
        errors.push('Sale must start before event begins');
      }
    }

    // Check applicable discounts
    const applicable = discounts.filter(d => {
      const validFrom = new Date(d.validFrom || 0);
      const validTo = new Date(d.validTo || 0);
      return validFrom <= saleEnd && validTo >= saleStart;
    });
    setApplicableDiscounts(applicable);

    if (applicable.length === 0 && discounts.length > 0) {
      warnings.push('No applicable discount codes for this sale period');
    }

    const result = { isValid: errors.length === 0, errors, warnings };
    setValidation(result);
    return result;
  };

  const handleOpenDialog = (ticket?: TicketType) => {
    if (ticket) {
      setEditingId(ticket.id || null);
      setForm({
        name: ticket.name || '',
        price: ticket.price || 0,
        quantity: (ticket.quota as number) || 0,
        saleStartTime: (ticket.startSale as string) || new Date().toISOString().slice(0, 16),
        saleEndTime: (ticket.endSale as string) || '',
        description: '',
      });
    } else {
      setEditingId(null);
      setForm({
        name: '',
        price: 0,
        quantity: 0,
        saleStartTime: new Date().toISOString().slice(0, 16),
        saleEndTime: eventStartTime ? new Date(eventStartTime).toISOString().slice(0, 16) : '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSaveTicket = async () => {
    if (!validation.isValid) {
      showNotification('Please fix validation errors', 'error');
      return;
    }

    if (!eventId) {
      showNotification('Event not found', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: editingId || undefined,
        name: form.name,
        price: form.price,
        quota: form.quantity,
        startSale: form.saleStartTime,
        endSale: form.saleEndTime,
      } as any;

      // API currently exposes POST /api/events/{eventId}/ticket-types for creation.
      // Use the same endpoint for updates as a pragmatic fallback (server handles id if provided).
      await EventsService.postApiEventsTicketTypes(eventId, payload as TicketType);
      showNotification(editingId ? 'Ticket type updated successfully!' : 'Ticket type created successfully!', 'success');

      setOpenDialog(false);
      fetchTicketTypes();
    } catch (err: any) {
      showNotification(err.body?.message || 'Failed to save ticket type', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (id: number) => {
    if (!window.confirm('Delete this ticket type? This cannot be undone.')) return;

    setLoading(true);
    try {
      await EventsService.deleteApiEventsTicketTypes(id);
      showNotification('Ticket type deleted', 'success');
      fetchTicketTypes();
    } catch (err: any) {
      showNotification('Failed to delete ticket type', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quotaUsed = 0; // server does not currently expose sold count in TicketType model
  const quotaTotal = ticketTypes.reduce((sum, t) => sum + ((t.quota as number) || 0), 0);
  const quotaPercent = quotaTotal > 0 ? (quotaUsed / quotaTotal) * 100 : 0;
  const totalRevenue = ticketTypes.reduce((sum, t) => sum + ((t.price || 0) * ((t.quota as number) || 0)), 0);

  return (
    <Card>
      <CardHeader
        title="Ticket Type Management"
        action={
          <Button
            onClick={() => handleOpenDialog()}
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!eventId}
          >
            New Ticket Type
          </Button>
        }
      />
      <CardContent sx={{ display: 'grid', gap: 3 }}>
        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <Typography variant="caption" color="textSecondary">
              Total Types
            </Typography>
            <Typography variant="h6">
              {ticketTypes.length}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <Typography variant="caption" color="textSecondary">
              Quota
            </Typography>
            <Typography variant="h6">
              {quotaUsed}/{quotaTotal}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={quotaPercent}
              sx={{ mt: 1 }}
            />
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <Typography variant="caption" color="textSecondary">
              Revenue
            </Typography>
            <Typography variant="h6">
              ${totalRevenue.toFixed(2)}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <Typography variant="caption" color="textSecondary">
              Discounts
            </Typography>
            <Typography variant="h6">
              {discounts.length}
            </Typography>
          </Paper>
        </Box>

        {/* Ticket Types List */}
        {ticketTypes.length === 0 ? (
          <Alert severity="info">
            No ticket types created yet. Click "New Ticket Type" to add one.
          </Alert>
        ) : (
          <List>
            {ticketTypes.map(ticket => (
              <Paper key={ticket.id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {ticket.name}
                    </Typography>
                    {/* description not provided by API for ticket types */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 1, mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Price
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                          ${ticket.price?.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Quota
                        </Typography>
                        <Typography variant="body2">
                          {0}/{ticket.quota} sold
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={ticket.quota ? (0 / (ticket.quota as number)) * 100 : 0}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Sale Period
                        </Typography>
                        <Typography variant="caption">
                          {new Date((ticket.startSale as string) || '').toLocaleDateString()}
                          {' - '}
                          {new Date((ticket.endSale as string) || '').toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Revenue
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                          ${(((ticket.price || 0) * ((ticket.quota as number) || 0))).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(ticket)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTicket(ticket.id!)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </List>
        )}
      </CardContent>

      {/* Edit/Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Ticket Type' : 'Create Ticket Type'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'grid', gap: 2 }}>
          {/* Validation Messages */}
          {validation.errors.length > 0 && (
            <Alert severity="error" icon={<ErrorIcon />}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validation.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </Alert>
          )}
          {validation.warnings.length > 0 && (
            <Alert severity="warning" icon={<WarningIcon />}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validation.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Form Fields */}
          <TextField
            label="Ticket Type Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            fullWidth
            placeholder="e.g., VIP, Standard, Student"
          />

          <TextField
            label="Price"
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: Number(e.target.value) })}
            fullWidth
            inputProps={{ step: 0.01, min: 0 }}
          />

          <TextField
            label="Quantity Available"
            type="number"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
            fullWidth
            inputProps={{ min: 1 }}
          />

          <TextField
            label="Sale Start Time"
            type="datetime-local"
            value={form.saleStartTime}
            onChange={e => setForm({ ...form, saleStartTime: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Sale End Time"
            type="datetime-local"
            value={form.saleEndTime}
            onChange={e => setForm({ ...form, saleEndTime: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Description (Optional)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="e.g., Front row seats, Premium experience"
          />

          {/* Pricing Preview */}
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Pricing Summary
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Unit Price
                </Typography>
                <Typography variant="h6">
                  ${form.price.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Max Revenue
                </Typography>
                <Typography variant="h6" color="success.main">
                  ${(form.price * form.quantity).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Applicable Discounts */}
          {applicableDiscounts.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                Applicable Discount Codes
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {applicableDiscounts.map(d => (
                  <Chip
                    key={d.id}
                    label={`${d.code} (${d.discountPercent}%)`}
                    variant="outlined"
                    color="success"
                  />
                ))}
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveTicket}
            variant="contained"
            disabled={!validation.isValid || loading}
          >
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TicketTypeBuilder;
