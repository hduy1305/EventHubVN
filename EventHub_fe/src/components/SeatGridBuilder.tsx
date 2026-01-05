import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
} from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import type { Seat } from '../api/models/Seat';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';
import AddIcon from '@mui/icons-material/Add';

interface SeatGridBuilderProps {
  eventId: number | undefined;
}

interface GridConfig {
  sections: string;
  rows: string;
  seatsPerRow: number;
}

const SeatGridBuilder: React.FC<SeatGridBuilderProps> = ({ eventId }) => {
  const { showNotification } = useNotification();
  const [seats, setSeats] = useState<Seat[]>([]);
  // ticket types will be fetched if needed in future; omit local state for now
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    sections: 'A,B,C',
    rows: 'A,B,C,D,E',
    seatsPerRow: 10,
  });
  const [selectedCategory, setSelectedCategory] = useState('Standard');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchSeatsAndTypes();
    }
  }, [eventId]);

  const fetchSeatsAndTypes = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const fetchedSeats = await EventsService.getApiEventsSeats(eventId);
      setSeats(fetchedSeats);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải danh sách ghế');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const generateGrid = () => {
    if (!eventId) {
      showNotification('Please create event first', 'error');
      return;
    }

    const sections = gridConfig.sections.split(',').map(s => s.trim());
    const rows = gridConfig.rows.split(',').map(r => r.trim());
    const newSeats: Seat[] = [];

    sections.forEach(section => {
      rows.forEach(row => {
        for (let i = 1; i <= gridConfig.seatsPerRow; i++) {
          newSeats.push({
            section,
            rowLabel: row,
            seatNumber: String(i).padStart(2, '0'),
            seatCategory: selectedCategory,
            isAvailable: true,
            locked: false,
            event: { id: eventId },
          });
        }
      });
    });

    setSeats(newSeats);
    setShowPreview(true);
    showNotification(`Generated ${newSeats.length} seats. Click "Save Seats" to confirm.`, 'info');
  };

  const saveSeats = async () => {
    if (!eventId || seats.length === 0) {
      showNotification('No seats to save', 'error');
      return;
    }

    setLoading(true);
    try {
      // Post all new seats in a single batch request
      const newSeats = seats.filter(s => !s.id);
      if (newSeats.length > 0) {
        await EventsService.postApiEventsSeats(eventId, newSeats);
      }
      showNotification(`${seats.length} seats saved successfully!`, 'success');
      setShowPreview(false);
      fetchSeatsAndTypes();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể lưu bố cục ghế');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  // Grid preview
  const sections = gridConfig.sections.split(',').map(s => s.trim());
  const rows = gridConfig.rows.split(',').map(r => r.trim());
  // limited preview will be rendered directly from `seats`

  return (
    <Card sx={{ mb: 4 }}>
      <CardHeader title="Seat Grid Builder" />
      <CardContent sx={{ display: 'grid', gap: 3 }}>
        {/* Configuration */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Sections (comma-separated)"
            value={gridConfig.sections}
            onChange={e => setGridConfig({ ...gridConfig, sections: e.target.value })}
            placeholder="A,B,C"
          />
          <TextField
            label="Rows (comma-separated)"
            value={gridConfig.rows}
            onChange={e => setGridConfig({ ...gridConfig, rows: e.target.value })}
            placeholder="A,B,C,D,E"
          />
          <TextField
            label="Seats per Row"
            type="number"
            value={gridConfig.seatsPerRow}
            onChange={e => setGridConfig({ ...gridConfig, seatsPerRow: Number(e.target.value) })}
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Seat Category"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            placeholder="Standard, VIP, etc."
          />
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={generateGrid}
            disabled={loading || !eventId}
            startIcon={<AddIcon />}
          >
            Generate Grid
          </Button>
          {seats.length > 0 && (
            <Chip
              label={`${seats.length} seats`}
              color="primary"
            />
          )}
        </Box>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Seat Grid Preview</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Preview: {Math.min(100, seats.length)} of {seats.length} total seats
            </Alert>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {rows.map(row => (
                <Box key={row} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                  <Typography variant="caption" sx={{ minWidth: 20 }}>
                    {row}
                  </Typography>
                  {sections.map(section =>
                    [...Array(Math.min(10, gridConfig.seatsPerRow))].map((_, i) => (
                      <Box
                        key={`${section}-${row}-${i}`}
                        sx={{
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#e0e0e0',
                          border: '1px solid #999',
                          fontSize: '10px',
                          borderRadius: '2px',
                        }}
                      >
                        ☐
                      </Box>
                    ))
                  )}
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPreview(false)}>Cancel</Button>
            <Button onClick={saveSeats} variant="contained" disabled={loading}>
              Save Seats
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SeatGridBuilder;
