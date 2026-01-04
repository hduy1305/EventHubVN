import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import { useNotification } from '../context/NotificationContext';
import type { Discount } from '../api/models/Discount';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface PromotionCodeGeneratorProps {
  eventId: number;
  open: boolean;
  onClose: () => void;
  onSuccess?: (discount: Discount) => void;
}

const PromotionCodeGenerator: React.FC<PromotionCodeGeneratorProps> = ({
  eventId,
  open,
  onClose,
  onSuccess,
}) => {
  const { showNotification } = useNotification();
  const [discountPercent, setDiscountPercent] = useState(10);
  const [usageLimit, setUsageLimit] = useState(100);
  const [validityDays, setValidityDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<Discount | null>(null);

  const handleGenerateCode = async () => {
    if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
      showNotification('Discount percentage must be between 1 and 100', 'error');
      return;
    }

    setLoading(true);
    try {
      const code = `PROMO_${eventId}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const now = new Date();
      const validFrom = now.toISOString();
      const validTo = new Date(now.getTime() + (validityDays || 30) * 24 * 60 * 60 * 1000).toISOString();
      const payload = {
        code,
        discountPercent,
        usageLimit: usageLimit || 100,
        validFrom,
        validTo,
        event: { id: eventId },
      } as any;

      const discount = await EventsService.postApiEventsDiscounts(eventId, payload);
      setGeneratedCode(discount);
      showNotification(`Promotion code ${discount.code} generated successfully!`, 'success');
      onSuccess?.(discount);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.message || 'Failed to generate promotion code';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode?.code) {
      navigator.clipboard.writeText(generatedCode.code);
      showNotification('Code copied to clipboard!', 'success');
    }
  };

  const handleClose = () => {
    setGeneratedCode(null);
    setDiscountPercent(10);
    setUsageLimit(100);
    setValidityDays(30);
    onClose();
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Promotion Code</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {generatedCode ? (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              ✓ Promotion code generated successfully!
            </Alert>
            <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="caption" color="textSecondary">
                  Promotion Code
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 1,
                    p: 1.5,
                    bgcolor: 'white',
                    border: '2px dashed #2196F3',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                    {generatedCode.code}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyCode}
                  >
                    Copy
                  </Button>
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ textAlign: 'left', mt: 2, p: 1.5, bgcolor: '#f9f9f9', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Discount:</strong> {generatedCode.discountPercent}% OFF
              </Typography>
              <Typography variant="body2">
                <strong>Max Uses:</strong> {generatedCode.usageLimit}
              </Typography>
              <Typography variant="body2">
                <strong>Valid From:</strong> {new Date(generatedCode.validFrom!).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                <strong>Valid Until:</strong> {new Date(generatedCode.validTo!).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Discount Percentage"
              type="number"
              value={discountPercent}
              onChange={e => setDiscountPercent(Number(e.target.value))}
              inputProps={{ min: 1, max: 100 }}
              fullWidth
              helperText="Enter discount percentage (1-100)"
            />
            <TextField
              label="Usage Limit"
              type="number"
              value={usageLimit}
              onChange={e => setUsageLimit(Number(e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
              helperText="Maximum number of times this code can be used"
            />
            <TextField
              label="Validity (Days)"
              type="number"
              value={validityDays}
              onChange={e => setValidityDays(Number(e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
              helperText="Number of days the code will be valid"
            />
            <Alert severity="info">
              A unique promotional code will be auto-generated with the specified settings.
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!generatedCode ? (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleGenerateCode}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              Generate Code
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PromotionCodeGenerator;
