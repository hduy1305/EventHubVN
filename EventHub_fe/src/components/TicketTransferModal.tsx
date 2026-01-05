import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { TicketsService } from '../api/services/TicketsService';
import { UsersService } from '../api/services/UsersService';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';

interface TicketTransferModalProps {
  show: boolean;
  onHide: () => void;
  ticketCode: string;
  onTransferSuccess: () => void;
}

const TicketTransferModal: React.FC<TicketTransferModalProps> = ({
  show,
  onHide,
  ticketCode,
  onTransferSuccess,
}) => {
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const recipientEmail = newAttendeeEmail.trim();
      if (!recipientEmail) {
        showNotification('Recipient email is required.', 'error');
        return;
      }
      const userExists = await UsersService.getApiUsersExists(recipientEmail);
      if (!userExists) {
        showNotification('Recipient user does not exist.', 'error');
        return;
      }
      await TicketsService.postApiTicketsTransfer(
        ticketCode,
        newAttendeeName,
        recipientEmail
      );
      showNotification('Ticket transferred successfully!', 'success');
      onTransferSuccess();
      setTimeout(onHide, 2000);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể chuyển vé');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onClose={onHide}>
      <DialogTitle>Transfer Ticket: {ticketCode}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="newAttendeeName"
          label="New Attendee Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newAttendeeName}
          onChange={(e) => setNewAttendeeName(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="newAttendeeEmail"
          label="New Attendee Email"
          type="email"
          fullWidth
          variant="outlined"
          value={newAttendeeEmail}
          onChange={(e) => setNewAttendeeEmail(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onHide} disabled={loading}>Cancel</Button>
        <Button onClick={handleTransfer} variant="contained" disabled={loading || !newAttendeeName || !newAttendeeEmail}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketTransferModal;
